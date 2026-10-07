const mysql = require("mysql2/promise");

const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const {
  EventBridgeClient,
  PutEventsCommand
} = require("@aws-sdk/client-eventbridge");


const secretsClient = new SecretsManagerClient({});
const eventBridgeClient = new EventBridgeClient({});


/*
============================================================
Database
============================================================
*/

async function getDatabaseCredentials() {
  const response = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: process.env.DB_SECRET_ARN
    })
  );

  return JSON.parse(response.SecretString);
}


async function getDatabaseConnection() {
  const credentials = await getDatabaseCredentials();

  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: credentials.username,
    password: credentials.password
  });
}


/*
============================================================
Admin Authorization
============================================================
*/

function isAdmin(event) {
  const requiredGroup =
    process.env.REQUIRED_ADMIN_GROUP || "Admin";

  const groupsClaim =
    event?.requestContext?.authorizer?.claims?.["cognito:groups"];

  if (!groupsClaim) {
    return false;
  }

  let groups = [];

  try {
    if (groupsClaim.startsWith("[")) {
      groups = JSON.parse(groupsClaim);
    } else {
      groups = groupsClaim
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(",")
        .map(group => group.trim());
    }
  } catch {
    groups = groupsClaim
      .replace(/^\[/, "")
      .replace(/\]$/, "")
      .split(",")
      .map(group => group.trim());
  }

  return groups.includes(requiredGroup);
}


/*
============================================================
EventBridge
============================================================
*/

async function publishEvent(detailType, detail) {
  try {
    const command = new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME,

          Source: "helpin.application",

          DetailType: detailType,

          Detail: JSON.stringify({
            ...detail,
            timestamp: new Date().toISOString()
          })
        }
      ]
    });

    const response =
      await eventBridgeClient.send(command);

    console.log(
      "EventBridge event published:",
      detailType,
      JSON.stringify(response)
    );

  } catch (error) {
    /*
      Do not fail the database operation just because
      asynchronous event logging failed.
    */
    console.error(
      "Failed to publish EventBridge event:",
      detailType,
      error
    );
  }
}


/*
============================================================
Response Helper
============================================================
*/

function response(statusCode, body) {
  return {
    statusCode,

    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin":
        process.env.CORS_ALLOWED_ORIGIN || "*"
    },

    body: JSON.stringify(body)
  };
}


/*
============================================================
Main Lambda Handler
============================================================
*/

exports.handler = async (event) => {

  console.log(
    "Admin request:",
    JSON.stringify(event, null, 2)
  );

  /*
  ----------------------------------------------------------
  Check Cognito Admin group
  ----------------------------------------------------------
  */

  if (!isAdmin(event)) {
    return response(403, {
      message: "Admin access is required"
    });
  }


  let connection;

  try {

    connection =
      await getDatabaseConnection();


    const method =
      event.httpMethod;

    const path =
      event.resource || event.path || "";

    const id =
      event.pathParameters?.id;

    const body =
      event.body
        ? JSON.parse(event.body)
        : {};


    /*
    ========================================================
    SERVICES
    ========================================================
    */

    if (path.includes("/services")) {

      /*
      ------------------------------------------------------
      CREATE SERVICE
      POST /services
      ------------------------------------------------------
      */

      if (
        method === "POST" &&
        !id
      ) {

        const {
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
        } = body;


        if (
          !name ||
          !category ||
          !location
        ) {
          return response(400, {
            message:
              "name, category and location are required"
          });
        }


        const [result] =
          await connection.execute(
            `
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
            `,
            [
              name,
              category,
              location,
              description || null,
              price ?? null,
              cost_type || null,
              service_type || null,
              contact_number || null,
              website_url || null,
              opening_hours || null,
              image_url || null,
              status || "Active"
            ]
          );


        const serviceId =
          result.insertId;


        const [[service]] =
          await connection.execute(
            `
            SELECT *
            FROM services
            WHERE id = ?
            `,
            [serviceId]
          );


        await publishEvent(
          "ServiceCreated",
          {
            serviceId,
            name: service.name,
            action: "CREATE"
          }
        );


        return response(201, {
          message:
            "Service created successfully",

          service
        });
      }


      /*
      ------------------------------------------------------
      UPDATE SERVICE
      PUT /services/{id}
      ------------------------------------------------------
      */

      if (
        method === "PUT" &&
        id
      ) {

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

          if (
            body[field] !== undefined
          ) {

            updates.push(
              `${field} = ?`
            );

            values.push(
              body[field]
            );
          }
        }


        if (
          updates.length === 0
        ) {

          return response(400, {
            message:
              "No valid fields supplied for update"
          });
        }


        values.push(id);


        const [result] =
          await connection.execute(
            `
            UPDATE services
            SET ${updates.join(", ")}
            WHERE id = ?
            `,
            values
          );


        if (
          result.affectedRows === 0
        ) {

          return response(404, {
            message:
              "Service not found"
          });
        }


        const [[service]] =
          await connection.execute(
            `
            SELECT *
            FROM services
            WHERE id = ?
            `,
            [id]
          );


        await publishEvent(
          "ServiceUpdated",
          {
            serviceId: Number(id),
            name: service.name,
            action: "UPDATE"
          }
        );


        return response(200, {
          message:
            "Service updated successfully",

          service
        });
      }


      /*
      ------------------------------------------------------
      DELETE SERVICE
      DELETE /services/{id}
      ------------------------------------------------------
      */

      if (
        method === "DELETE" &&
        id
      ) {

        const [result] =
          await connection.execute(
            `
            UPDATE services
            SET status = 'Inactive'
            WHERE id = ?
            `,
            [id]
          );


        if (
          result.affectedRows === 0
        ) {

          return response(404, {
            message:
              "Service not found"
          });
        }


        await publishEvent(
          "ServiceDeleted",
          {
            serviceId: Number(id),
            action: "DELETE"
          }
        );


        return response(200, {
          message:
            "Service deleted successfully",

          id: Number(id)
        });
      }
    }


    /*
    ========================================================
    JOBS
    ========================================================
    */

    if (path.includes("/jobs")) {

      /*
      ------------------------------------------------------
      CREATE JOB
      POST /jobs
      ------------------------------------------------------
      */

      if (
        method === "POST" &&
        !id
      ) {

        const {
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
        } = body;


        if (
          !title ||
          !category ||
          !job_type ||
          !location ||
          !external_url
        ) {

          return response(400, {
            message:
              "title, category, job_type, location and external_url are required"
          });
        }


        const [result] =
          await connection.execute(
            `
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
            `,
            [
              title,
              company || null,
              category,
              job_type,
              location,
              pay || null,
              description || null,
              experience_requirement || null,
              external_url,
              image_url || null,
              status || "Active"
            ]
          );


        const jobId =
          result.insertId;


        const [[job]] =
          await connection.execute(
            `
            SELECT *
            FROM jobs
            WHERE id = ?
            `,
            [jobId]
          );


        await publishEvent(
          "JobCreated",
          {
            jobId,
            title: job.title,
            action: "CREATE"
          }
        );


        return response(201, {
          message:
            "Job created successfully",

          job
        });
      }


      /*
      ------------------------------------------------------
      UPDATE JOB
      PUT /jobs/{id}
      ------------------------------------------------------
      */

      if (
        method === "PUT" &&
        id
      ) {

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

          if (
            body[field] !== undefined
          ) {

            updates.push(
              `${field} = ?`
            );

            values.push(
              body[field]
            );
          }
        }


        if (
          updates.length === 0
        ) {

          return response(400, {
            message:
              "No valid fields supplied for update"
          });
        }


        values.push(id);


        const [result] =
          await connection.execute(
            `
            UPDATE jobs
            SET ${updates.join(", ")}
            WHERE id = ?
            `,
            values
          );


        if (
          result.affectedRows === 0
        ) {

          return response(404, {
            message:
              "Job not found"
          });
        }


        const [[job]] =
          await connection.execute(
            `
            SELECT *
            FROM jobs
            WHERE id = ?
            `,
            [id]
          );


        await publishEvent(
          "JobUpdated",
          {
            jobId: Number(id),
            title: job.title,
            action: "UPDATE"
          }
        );


        return response(200, {
          message:
            "Job updated successfully",

          job
        });
      }


      /*
      ------------------------------------------------------
      DELETE JOB
      DELETE /jobs/{id}
      ------------------------------------------------------
      */

      if (
        method === "DELETE" &&
        id
      ) {

        const [result] =
          await connection.execute(
            `
            UPDATE jobs
            SET status = 'Inactive'
            WHERE id = ?
            `,
            [id]
          );


        if (
          result.affectedRows === 0
        ) {

          return response(404, {
            message:
              "Job not found"
          });
        }


        await publishEvent(
          "JobDeleted",
          {
            jobId: Number(id),
            action: "DELETE"
          }
        );


        return response(200, {
          message:
            "Job deleted successfully",

          id: Number(id)
        });
      }
    }


    /*
    ----------------------------------------------------------
    Unsupported request
    ----------------------------------------------------------
    */

    return response(405, {
      message:
        "Unsupported admin route or method"
    });


  } catch (error) {

    console.error(
      "Admin function error:",
      error
    );


    return response(500, {
      message:
        "Internal server error"
    });


  } finally {

    if (connection) {
      await connection.end();
    }
  }
};
