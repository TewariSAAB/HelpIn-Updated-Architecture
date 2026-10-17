const mysql = require("mysql2/promise");

const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const {
  EventBridgeClient,
  PutEventsCommand
} = require("@aws-sdk/client-eventbridge");

const {
  S3Client,
  PutObjectCommand
} = require("@aws-sdk/client-s3");

const {
  getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const {
  randomUUID
} = require("crypto");


const secretsClient = new SecretsManagerClient({});
const eventBridgeClient = new EventBridgeClient({});
const s3Client = new S3Client({});


const MAX_SERVICE_IMAGE_BYTES =
  5 * 1024 * 1024;

const SERVICE_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};


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


async function ensureContactMessagesTable(connection) {
  await connection.execute(
    `
    CREATE TABLE IF NOT EXISTS contact_messages
    (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      reason VARCHAR(80) NOT NULL,
      name VARCHAR(100) NULL,
      email VARCHAR(254) NULL,
      message TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'New',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_contact_status (status),
      INDEX idx_contact_created_at (created_at)
    )
    `
  );
}


function cleanText(value, maxLength) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}


function isValidEmail(email) {
  if (!email) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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


function publicContactResponse(statusCode, body) {
  return {
    statusCode,

    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
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

  const requestMethod =
    event.httpMethod || "";

  const requestPath =
    event.resource ||
    event.path ||
    "";

  console.log(
    "Admin function request:",
    requestMethod,
    requestPath
  );


  /*
  ----------------------------------------------------------
  Public contact form
  ----------------------------------------------------------
  */

  if (
    requestMethod === "POST" &&
    requestPath === "/contact"
  ) {
    let contactConnection;

    try {
      let contactBody = {};

      try {
        contactBody =
          event.body
            ? JSON.parse(event.body)
            : {};
      } catch {
        return publicContactResponse(400, {
          message:
            "Request body must be valid JSON"
        });
      }

      const reason =
        cleanText(
          contactBody.reason,
          80
        );

      const name =
        cleanText(
          contactBody.name,
          100
        );

      const email =
        cleanText(
          contactBody.email,
          254
        ).toLowerCase();

      const message =
        cleanText(
          contactBody.message,
          2000
        );

      if (!reason || !message) {
        return publicContactResponse(400, {
          message:
            "Reason and message are required"
        });
      }

      if (!isValidEmail(email)) {
        return publicContactResponse(400, {
          message:
            "Please enter a valid email address"
        });
      }

      contactConnection =
        await getDatabaseConnection();

      await ensureContactMessagesTable(
        contactConnection
      );

      const [result] =
        await contactConnection.execute(
          `
          INSERT INTO contact_messages
          (
            reason,
            name,
            email,
            message,
            status
          )
          VALUES (?, ?, ?, ?, 'New')
          `,
          [
            reason,
            name || null,
            email || null,
            message
          ]
        );

      return publicContactResponse(201, {
        message:
          "Your message has been sent to HelpIn.",
        id:
          result.insertId
      });

    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      return publicContactResponse(500, {
        message:
          "Unable to send your message right now"
      });

    } finally {
      if (contactConnection) {
        await contactConnection.end();
      }
    }
  }


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


  // Generate a short-lived upload URL for an admin-selected service image.
  const uploadPath =
    requestPath;

  if (
    event.httpMethod === "POST" &&
    uploadPath.includes(
      "/admin/service-image-upload"
    )
  ) {
    let uploadBody = {};

    try {
      uploadBody =
        event.body
          ? JSON.parse(event.body)
          : {};
    } catch {
      return response(400, {
        message: "Request body must be valid JSON"
      });
    }

    const contentType =
      String(
        uploadBody.content_type ||
        uploadBody.contentType ||
        ""
      ).toLowerCase();

    const fileSize =
      Number(
        uploadBody.file_size ||
        uploadBody.fileSize ||
        0
      );

    const extension =
      SERVICE_IMAGE_TYPES[contentType];

    if (!extension) {
      return response(400, {
        message:
          "Only JPEG, PNG and WebP images are allowed"
      });
    }

    if (
      !Number.isFinite(fileSize) ||
      fileSize <= 0 ||
      fileSize > MAX_SERVICE_IMAGE_BYTES
    ) {
      return response(400, {
        message:
          "Service images must be no larger than 5 MB"
      });
    }

    if (!process.env.ASSETS_BUCKET) {
      return response(500, {
        message:
          "Assets bucket is not configured"
      });
    }

    const imageKey =
      `services/${randomUUID()}.${extension}`;

    const uploadUrl =
      await getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket:
            process.env.ASSETS_BUCKET,
          Key:
            imageKey,
          ContentType:
            contentType
        }),
        {
          expiresIn: 300
        }
      );

    return response(200, {
      upload_url: uploadUrl,
      image_key: imageKey,
      expires_in: 300,
      max_size_bytes:
        MAX_SERVICE_IMAGE_BYTES
    });
  }


  let connection;

  try {

    connection =
      await getDatabaseConnection();


    const method =
      requestMethod;

    const path =
      requestPath;

    const id =
      event.pathParameters?.id;

    const body =
      event.body
        ? JSON.parse(event.body)
        : {};


    /*
    ========================================================
    CONTACT MESSAGES
    ========================================================
    */

    if (
      path.includes(
        "/admin/contact-messages"
      )
    ) {
      await ensureContactMessagesTable(
        connection
      );

      if (
        method === "GET" &&
        !id
      ) {
        const [messages] =
          await connection.execute(
            `
            SELECT
              id,
              reason,
              name,
              email,
              message,
              status,
              created_at,
              updated_at
            FROM contact_messages
            ORDER BY created_at DESC
            LIMIT 200
            `
          );

        return response(200, {
          count:
            messages.length,
          messages
        });
      }

      if (
        method === "PUT" &&
        id
      ) {
        const nextStatus =
          cleanText(
            body.status,
            20
          );

        const allowedStatuses = [
          "New",
          "Reviewed",
          "Resolved"
        ];

        if (
          !allowedStatuses.includes(
            nextStatus
          )
        ) {
          return response(400, {
            message:
              "Status must be New, Reviewed or Resolved"
          });
        }

        const [result] =
          await connection.execute(
            `
            UPDATE contact_messages
            SET status = ?
            WHERE id = ?
            `,
            [
              nextStatus,
              id
            ]
          );

        if (
          result.affectedRows === 0
        ) {
          return response(404, {
            message:
              "Contact message not found"
          });
        }

        const [[contactMessage]] =
          await connection.execute(
            `
            SELECT
              id,
              reason,
              name,
              email,
              message,
              status,
              created_at,
              updated_at
            FROM contact_messages
            WHERE id = ?
            `,
            [id]
          );

        return response(200, {
          message:
            "Contact message updated successfully",
          contactMessage
        });
      }
    }


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
