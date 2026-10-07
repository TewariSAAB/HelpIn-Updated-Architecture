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

function addServiceScore(service, filters) {
  let score = 0;

  if (
    filters.location &&
    service.location.toLowerCase() === filters.location.toLowerCase()
  ) {
    score += 3;
  }

  if (
    filters.category &&
    service.category.toLowerCase() === filters.category.toLowerCase()
  ) {
    score += 2;
  }

  if (
    filters.serviceType &&
    service.service_type &&
    service.service_type.toLowerCase() === filters.serviceType.toLowerCase()
  ) {
    score += 2;
  }

  if (
    filters.maxPrice &&
    Number(service.price) <= Number(filters.maxPrice)
  ) {
    score += 2;
  }

  return score;
}

function addJobScore(job, filters) {
  let score = 0;

  if (
    filters.location &&
    job.location.toLowerCase() === filters.location.toLowerCase()
  ) {
    score += 3;
  }

  if (
    filters.jobCategory &&
    job.category.toLowerCase() === filters.jobCategory.toLowerCase()
  ) {
    score += 2;
  }

  if (
    filters.jobType &&
    job.job_type &&
    job.job_type.toLowerCase() === filters.jobType.toLowerCase()
  ) {
    score += 2;
  }

  return score;
}

function matchesServiceFilters(service, filters) {
  if (
    filters.location &&
    service.location.toLowerCase() !== filters.location.toLowerCase()
  ) {
    return false;
  }

  if (
    filters.category &&
    service.category.toLowerCase() !== filters.category.toLowerCase()
  ) {
    return false;
  }

  if (
    filters.serviceType &&
    (
      !service.service_type ||
      service.service_type.toLowerCase() !== filters.serviceType.toLowerCase()
    )
  ) {
    return false;
  }

  if (
    filters.maxPrice &&
    Number(service.price) > Number(filters.maxPrice)
  ) {
    return false;
  }

  return true;
}

function matchesJobFilters(job, filters) {
  if (
    filters.location &&
    job.location.toLowerCase() !== filters.location.toLowerCase()
  ) {
    return false;
  }

  if (
    filters.jobCategory &&
    job.category.toLowerCase() !== filters.jobCategory.toLowerCase()
  ) {
    return false;
  }

  if (
    filters.jobType &&
    (
      !job.job_type ||
      job.job_type.toLowerCase() !== filters.jobType.toLowerCase()
    )
  ) {
    return false;
  }

  return true;
}

exports.handler = async (event) => {
  let connection;

  try {
    const filters = event.queryStringParameters || {};

    connection = await getDatabaseConnection();

    const [services] = await connection.execute(
      `SELECT *
       FROM services
       WHERE status = 'Active'`
    );

    const [jobs] = await connection.execute(
      `SELECT *
       FROM jobs
       WHERE status = 'Active'`
    );

    const recommendedServices = services
      .filter(service =>
        matchesServiceFilters(service, filters)
      )
      .map(service => ({
        ...service,
        recommendationScore: addServiceScore(service, filters)
      }))
      .sort(
        (a, b) =>
          b.recommendationScore - a.recommendationScore
      );

    const recommendedJobs = jobs
      .filter(job =>
        matchesJobFilters(job, filters)
      )
      .map(job => ({
        ...job,
        recommendationScore: addJobScore(job, filters)
      }))
      .sort(
        (a, b) =>
          b.recommendationScore - a.recommendationScore
      );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin":
          process.env.CORS_ALLOWED_ORIGIN || "*"
      },
      body: JSON.stringify({
        filtersUsed: filters,
        services: recommendedServices,
        jobs: recommendedJobs
      })
    };

  } catch (error) {
    console.error("Recommendation error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin":
          process.env.CORS_ALLOWED_ORIGIN || "*"
      },
      body: JSON.stringify({
        message: "Unable to generate recommendations"
      })
    };

  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
