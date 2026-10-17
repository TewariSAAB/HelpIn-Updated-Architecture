const mysql = require("mysql2/promise");

const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const {
  S3Client,
  GetObjectCommand
} = require("@aws-sdk/client-s3");

const {
  getSignedUrl
} = require("@aws-sdk/s3-request-presigner");


const secretsClient = new SecretsManagerClient({});
const s3Client = new S3Client({});


// The assets bucket is private, so service images are returned with temporary URLs.
async function addSignedServiceImage(service) {
  const storedImage =
    service?.image_url;

  if (!storedImage) {
    return {
      ...service,
      image_key: null,
      image_url: null
    };
  }

  if (
    /^https?:\/\//i.test(
      String(storedImage)
    )
  ) {
    return {
      ...service,
      image_key: null,
      image_url: storedImage
    };
  }

  try {
    const imageUrl =
      await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket:
            process.env.ASSETS_BUCKET,
          Key:
            storedImage
        }),
        {
          expiresIn: 3600
        }
      );

    return {
      ...service,
      image_key: storedImage,
      image_url: imageUrl
    };

  } catch (error) {
    console.error(
      "Unable to sign service image:",
      storedImage,
      error
    );

    return {
      ...service,
      image_key: storedImage,
      image_url: null
    };
  }
}

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

function response(statusCode, body, origin) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  const origin = process.env.CORS_ALLOWED_ORIGIN || "*";
  let connection;

  try {
    console.log("Search request:", JSON.stringify(event));

    const credentials = await getDatabaseCredentials();

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: credentials.username,
      password: credentials.password,
      database: process.env.DB_NAME,
      connectTimeout: 10000
    });

    console.log("Connected to HelpIn RDS.");

    const path = event.path || "";
    const resource = event.resource || "";
    const id = event.pathParameters?.id;
    const query = event.queryStringParameters || {};

    // =========================================================
    // JOBS
    // =========================================================

    if (path.startsWith("/jobs") || resource.startsWith("/jobs")) {
      let sql = `
        SELECT
          id,
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
          status,
          created_at,
          updated_at
        FROM jobs
        WHERE status = 'Active'
      `;

      const values = [];

      // GET /jobs/{id}
      if (id) {
        sql += " AND id = ?";
        values.push(id);
      }

      // GET /jobs?location=Birmingham
      if (query.location) {
        sql += " AND LOWER(location) = LOWER(?)";
        values.push(query.location);
      }

      // GET /jobs?category=Retail
      if (query.category) {
        sql += " AND LOWER(category) = LOWER(?)";
        values.push(query.category);
      }

      // GET /jobs?jobType=Part-time
      if (query.jobType) {
        sql += " AND LOWER(job_type) = LOWER(?)";
        values.push(query.jobType);
      }

      sql += " ORDER BY created_at DESC";

      const [jobs] = await connection.execute(sql, values);

      if (id && jobs.length === 0) {
        return response(
          404,
          {
            message: "Job not found"
          },
          origin
        );
      }

      if (id) {
        return response(
          200,
          {
            job: jobs[0]
          },
          origin
        );
      }

      return response(
        200,
        {
          count: jobs.length,
          jobs
        },
        origin
      );
    }

    // =========================================================
    // SERVICES
    // =========================================================

    if (
      path.startsWith("/services") ||
      resource.startsWith("/services")
    ) {
      let sql = `
        SELECT
          id,
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
          status,
          created_at,
          updated_at
        FROM services
        WHERE status = 'Active'
      `;

      const values = [];

      // GET /services/{id}
      if (id) {
        sql += " AND id = ?";
        values.push(id);
      }

      // GET /services?category=Food Support
      if (query.category) {
        sql += " AND LOWER(category) = LOWER(?)";
        values.push(query.category);
      }

      // GET /services?location=London
      if (query.location) {
        sql += " AND LOWER(location) = LOWER(?)";
        values.push(query.location);
      }

      // GET /services?serviceType=Food Bank
      if (query.serviceType) {
        sql += " AND LOWER(service_type) = LOWER(?)";
        values.push(query.serviceType);
      }

      // GET /services?maxPrice=500
      if (query.maxPrice) {
        const maxPrice = Number(query.maxPrice);

        if (!Number.isNaN(maxPrice)) {
          sql += " AND price <= ?";
          values.push(maxPrice);
        }
      }

      sql += " ORDER BY created_at DESC";

      const [services] = await connection.execute(sql, values);

      const servicesWithImages =
        await Promise.all(
          services.map(
            addSignedServiceImage
          )
        );

      if (id && services.length === 0) {
        return response(
          404,
          {
            message: "Service not found"
          },
          origin
        );
      }

      if (id) {
        return response(
          200,
          {
            service: servicesWithImages[0]
          },
          origin
        );
      }

      return response(
        200,
        {
          count: servicesWithImages.length,
          services: servicesWithImages
        },
        origin
      );
    }

    // Unknown API path
    return response(
      404,
      {
        message: "Route not found"
      },
      origin
    );

  } catch (error) {
    console.error("SearchFunction error:", error);

    return response(
      500,
      {
        message: "Unable to retrieve HelpIn data",
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
