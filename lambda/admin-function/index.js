const mysql = require("mysql2/promise");

const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const secretsClient = new SecretsManagerClient({});

async function getDatabaseCredentials() {
  const response = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: process.env.DB_SECRET_ARN
    })
  );

  if (!response.SecretString) {
    throw new Error("Database secret does not contain SecretString");
  }

  return JSON.parse(response.SecretString);
}

function createResponse(statusCode, body, origin) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin
    },
    body: JSON.stringify(body)
  };
}

function isAdmin(event) {
  const groups =
    event?.requestContext?.authorizer?.claims?.["cognito:groups"] || "";

  const requiredGroup =
    process.env.REQUIRED_ADMIN_GROUP || "Admin";

  const groupList = groups
    .split(",")
    .map(group => group.trim())
    .filter(Boolean);

  return groupList.includes(requiredGroup);
}

function parseBody(event) {
  if (!event.body) {
    return {};
  }

  if (typeof event.body === "object") {
    return event.body;
  }

  return JSON.parse(event.body);
}

exports.handler = async (event) => {
  const origin = process.env.CORS_ALLOWED_ORIGIN || "*";
  let connection;

  try {
    console.log("Admin request:", JSON.stringify(event));

    // ---------------------------------------------------------
    // CHECK COGNITO ADMIN GROUP
    // ---------------------------------------------------------

    if (!isAdmin(event)) {
      return createResponse(
        403,
        {
          message: "Admin access is required"
        },
        origin
      );
    }

    // ---------------------------------------------------------
    // CONNECT TO RDS
    // ---------------------------------------------------------

    const credentials = await getDatabaseCredentials();

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: credentials.username,
      password: credentials.password,
      database: process.env.DB_NAME,
      connectTimeout: 10000
    });

    console.log("AdminFunction connected to RDS.");

    const method = event.httpMethod;
    const path = event.path || "";
    const resource = event.resource || "";
    const id = event.pathParameters?.id;

    const body = parseBody(event);

    // =========================================================
    // SERVICES
    // =========================================================

    if (
      path.startsWith("/services") ||
      resource.startsWith("/services")
    ) {

      // -------------------------------------------------------
      // POST /services
      // -------------------------------------------------------

      if (method === "POST") {
        if (!body.name || !body.category || !body.location) {
          return createResponse(
            400,
            {
              message:
                "name, category and location are required"
            },
            origin
          );
        }

        const sql = `
          INSERT INTO services
          (
            name,
            category,
            location,
            description,
            price,
            cost_type,
            service_type,
            contact_number,
            website_url,
            opening_hours,
            image_url,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          body.name,
          body.category,
          body.location,
          body.description || null,
          body.price ?? null,
          body.cost_type || null,
          body.service_type || null,
          body.contact_number || null,
          body.website_url || null,
          body.opening_hours || null,
          body.image_url || null,
          body.status || "Active"
        ];

        const [result] = await connection.execute(
          sql,
          values
        );

        const [createdRows] = await connection.execute(
          "SELECT * FROM services WHERE id = ?",
          [result.insertId]
        );

        return createResponse(
          201,
          {
            message: "Service created successfully",
            service: createdRows[0]
          },
          origin
        );
      }

      // -------------------------------------------------------
      // PUT /services/{id}
      // -------------------------------------------------------

      if (method === "PUT" && id) {
        const allowedFields = [
          "name",
          "category",
          "location",
          "description",
          "price",
          "cost_type",
          "service_type",
          "contact_number",
          "website_url",
          "opening_hours",
          "image_url",
          "status"
        ];

        const updates = [];
        const values = [];

        for (const field of allowedFields) {
          if (Object.prototype.hasOwnProperty.call(body, field)) {
            updates.push(`${field} = ?`);
            values.push(body[field]);
          }
        }

        if (updates.length === 0) {
          return createResponse(
            400,
            {
              message: "No valid fields supplied for update"
            },
            origin
          );
        }

        values.push(id);

        const [result] = await connection.execute(
          `
            UPDATE services
            SET ${updates.join(", ")}
            WHERE id = ?
          `,
          values
        );

        if (result.affectedRows === 0) {
          return createResponse(
            404,
            {
              message: "Service not found"
            },
            origin
          );
        }

        const [updatedRows] = await connection.execute(
          "SELECT * FROM services WHERE id = ?",
          [id]
        );

        return createResponse(
          200,
          {
            message: "Service updated successfully",
            service: updatedRows[0]
          },
          origin
        );
      }

      // -------------------------------------------------------
      // DELETE /services/{id}
      // Soft delete
      // -------------------------------------------------------

      if (method === "DELETE" && id) {
        const [result] = await connection.execute(
          `
            UPDATE services
            SET status = 'Inactive'
            WHERE id = ?
          `,
          [id]
        );

        if (result.affectedRows === 0) {
          return createResponse(
            404,
            {
              message: "Service not found"
            },
            origin
          );
        }

        return createResponse(
          200,
          {
            message: "Service deleted successfully",
            id: Number(id)
          },
          origin
        );
      }
    }

    // =========================================================
    // JOBS
    // =========================================================

    if (
      path.startsWith("/jobs") ||
      resource.startsWith("/jobs")
    ) {

      // -------------------------------------------------------
      // POST /jobs
      // -------------------------------------------------------

      if (method === "POST") {
        if (
          !body.title ||
          !body.category ||
          !body.job_type ||
          !body.location ||
          !body.external_url
        ) {
          return createResponse(
            400,
            {
              message:
                "title, category, job_type, location and external_url are required"
            },
            origin
          );
        }

        const sql = `
          INSERT INTO jobs
          (
            title,
            company,
            category,
            job_type,
            location,
            pay,
            description,
            experience_requirement,
            external_url,
            image_url,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          body.title,
          body.company || null,
          body.category,
          body.job_type,
          body.location,
          body.pay || null,
          body.description || null,
          body.experience_requirement || null,
          body.external_url,
          body.image_url || null,
          body.status || "Active"
        ];

        const [result] = await connection.execute(
          sql,
          values
        );

        const [createdRows] = await connection.execute(
          "SELECT * FROM jobs WHERE id = ?",
          [result.insertId]
        );

        return createResponse(
          201,
          {
            message: "Job created successfully",
            job: createdRows[0]
          },
          origin
        );
      }

      // -------------------------------------------------------
      // PUT /jobs/{id}
      // -------------------------------------------------------

      if (method === "PUT" && id) {
        const allowedFields = [
          "title",
          "company",
          "category",
          "job_type",
          "location",
          "pay",
          "description",
          "experience_requirement",
          "external_url",
          "image_url",
          "status"
        ];

        const updates = [];
        const values = [];

        for (const field of allowedFields) {
          if (Object.prototype.hasOwnProperty.call(body, field)) {
            updates.push(`${field} = ?`);
            values.push(body[field]);
          }
        }

        if (updates.length === 0) {
          return createResponse(
            400,
            {
              message: "No valid fields supplied for update"
            },
            origin
          );
        }

        values.push(id);

        const [result] = await connection.execute(
          `
            UPDATE jobs
            SET ${updates.join(", ")}
            WHERE id = ?
          `,
          values
        );

        if (result.affectedRows === 0) {
          return createResponse(
            404,
            {
              message: "Job not found"
            },
            origin
          );
        }

        const [updatedRows] = await connection.execute(
          "SELECT * FROM jobs WHERE id = ?",
          [id]
        );

        return createResponse(
          200,
          {
            message: "Job updated successfully",
            job: updatedRows[0]
          },
          origin
        );
      }

      // -------------------------------------------------------
      // DELETE /jobs/{id}
      // Soft delete
      // -------------------------------------------------------

      if (method === "DELETE" && id) {
        const [result] = await connection.execute(
          `
            UPDATE jobs
            SET status = 'Inactive'
            WHERE id = ?
          `,
          [id]
        );

        if (result.affectedRows === 0) {
          return createResponse(
            404,
            {
              message: "Job not found"
            },
            origin
          );
        }

        return createResponse(
          200,
          {
            message: "Job deleted successfully",
            id: Number(id)
          },
          origin
        );
      }
    }

    return createResponse(
      405,
      {
        message: "Method or route not supported"
      },
      origin
    );

  } catch (error) {
    console.error("AdminFunction error:", error);

    return createResponse(
      500,
      {
        message: "Admin operation failed",
        error: error.message
      },
      origin
    );

  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed.");
    }
  }
};
