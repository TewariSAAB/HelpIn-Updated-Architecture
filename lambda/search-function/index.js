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

    const serviceId = event.pathParameters?.id;
    const query = event.queryStringParameters || {};

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
    if (serviceId) {
      sql += " AND id = ?";
      values.push(serviceId);
    }

    // GET /services?category=Food Support
    if (query.category) {
      sql += " AND category = ?";
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

    const [results] = await connection.execute(sql, values);

    if (serviceId && results.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin
        },
        body: JSON.stringify({
          message: "Service not found"
        })
      };
    }

    // Single service request
    if (serviceId) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin
        },
        body: JSON.stringify({
          service: results[0]
        })
      };
    }

    // Multiple services request
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin
      },
      body: JSON.stringify({
        count: results.length,
        services: results
      })
    };

  } catch (error) {
    console.error("SearchFunction error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin
      },
      body: JSON.stringify({
        message: "Unable to retrieve services",
        error: error.message
      })
    };

  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
