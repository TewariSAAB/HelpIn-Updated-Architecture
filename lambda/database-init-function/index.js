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

exports.handler = async () => {
  let connection;

  try {
    console.log("Starting HelpIn database initialization...");

    // Get username and password from AWS Secrets Manager
    const credentials = await getDatabaseCredentials();

    console.log("Database credentials retrieved from Secrets Manager.");

    // Connect to RDS MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: credentials.username,
      password: credentials.password,
      database: process.env.DB_NAME,
      connectTimeout: 10000
    });

    console.log("Connected to HelpIn RDS successfully.");

    // ---------------------------------------------------------
    // CREATE SERVICES TABLE
    // ---------------------------------------------------------

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,

        category ENUM(
          'Accommodation',
          'Food Support'
        ) NOT NULL,

        location VARCHAR(150) NOT NULL,
        description TEXT,

        price DECIMAL(10,2) NULL,
        cost_type VARCHAR(50) NULL,
        service_type VARCHAR(100) NULL,

        contact_number VARCHAR(50) NULL,
        website_url VARCHAR(500) NULL,
        opening_hours VARCHAR(255) NULL,
        image_url VARCHAR(500) NULL,

        status ENUM(
          'Active',
          'Inactive'
        ) NOT NULL DEFAULT 'Active',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("services table created or already exists.");

    // ---------------------------------------------------------
    // CREATE JOBS TABLE
    // ---------------------------------------------------------

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,

        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NULL,
        category VARCHAR(100) NOT NULL,

        job_type ENUM(
          'Full-time',
          'Part-time',
          'Temporary',
          'Flexible'
        ) NOT NULL,

        location VARCHAR(150) NOT NULL,
        pay VARCHAR(100) NULL,

        description TEXT,
        experience_requirement VARCHAR(100) NULL,

        external_url VARCHAR(500) NOT NULL,
        image_url VARCHAR(500) NULL,

        status ENUM(
          'Active',
          'Inactive'
        ) NOT NULL DEFAULT 'Active',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("jobs table created or already exists.");

    // ---------------------------------------------------------
    // INSERT SAMPLE SERVICES
    // ---------------------------------------------------------

    const [serviceCountResult] = await connection.execute(
      "SELECT COUNT(*) AS total FROM services"
    );

    const serviceCount = Number(serviceCountResult[0].total);

    if (serviceCount === 0) {
      const serviceSql = `
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
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(serviceSql, [
        "Riverside Apartments",
        "Accommodation",
        "London",
        "Affordable shared accommodation for newcomers.",
        450.00,
        "Per Month",
        "Shared Room",
        "020 0000 0001",
        "https://example.com/riverside-apartments",
        "Monday to Friday 09:00-17:00",
        "Active"
      ]);

      await connection.execute(serviceSql, [
        "Hope Community Food Bank",
        "Food Support",
        "London",
        "Provides emergency food support to local residents.",
        0.00,
        "Free",
        "Food Bank",
        "020 0000 0002",
        "https://example.com/hope-food-bank",
        "Monday, Wednesday and Friday 10:00-15:00",
        "Active"
      ]);

      await connection.execute(serviceSql, [
        "St Mary's Community Kitchen",
        "Food Support",
        "Birmingham",
        "Community kitchen providing free meals and support.",
        0.00,
        "Free",
        "Community Kitchen",
        "0121 000 0003",
        "https://example.com/community-kitchen",
        "Tuesday to Saturday 11:00-16:00",
        "Active"
      ]);

      console.log("Sample services inserted.");
    } else {
      console.log(
        `services table already contains ${serviceCount} records.`
      );
    }

    // ---------------------------------------------------------
    // INSERT SAMPLE JOBS
    // ---------------------------------------------------------

    const [jobCountResult] = await connection.execute(
      "SELECT COUNT(*) AS total FROM jobs"
    );

    const jobCount = Number(jobCountResult[0].total);

    if (jobCount === 0) {
      const jobSql = `
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
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(jobSql, [
        "Retail Assistant",
        "City Retail Ltd",
        "Retail",
        "Part-time",
        "Birmingham",
        "£12.00 per hour",
        "Entry-level retail assistant role.",
        "Beginner Friendly",
        "https://example.com/jobs/retail-assistant",
        "Active"
      ]);

      await connection.execute(jobSql, [
        "Warehouse Assistant",
        "City Logistics Ltd",
        "Warehouse",
        "Full-time",
        "Leeds",
        "£12.50 per hour",
        "Warehouse role with training provided.",
        "No Experience Required",
        "https://example.com/jobs/warehouse-assistant",
        "Active"
      ]);

      await connection.execute(jobSql, [
        "Kitchen Assistant",
        "Community Kitchen Ltd",
        "Hospitality",
        "Part-time",
        "Manchester",
        "£11.80 per hour",
        "Entry-level kitchen support role.",
        "Training Provided",
        "https://example.com/jobs/kitchen-assistant",
        "Active"
      ]);

      console.log("Sample jobs inserted.");
    } else {
      console.log(
        `jobs table already contains ${jobCount} records.`
      );
    }

    // ---------------------------------------------------------
    // VERIFY DATA
    // ---------------------------------------------------------

    const [serviceResults] = await connection.execute(`
      SELECT
        id,
        name,
        category,
        location,
        status
      FROM services
    `);

    const [jobResults] = await connection.execute(`
      SELECT
        id,
        title,
        company,
        location,
        status
      FROM jobs
    `);

    console.log("Database initialization completed successfully.");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "HelpIn database initialized successfully",
        servicesCount: serviceResults.length,
        jobsCount: jobResults.length,
        services: serviceResults,
        jobs: jobResults
      })
    };

  } catch (error) {
    console.error("Database initialization error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "HelpIn database initialization failed",
        error: error.message
      })
    };

  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed.");
    }
  }
};
