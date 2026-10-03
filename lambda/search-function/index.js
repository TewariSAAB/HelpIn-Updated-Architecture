exports.handler = async (event) => {
  console.log("Search request received:", JSON.stringify(event));

  const services = [
    {
      id: "1",
      name: "London Community Food Bank",
      category: "Food Support",
      location: "London",
      description: "Provides emergency food support."
    },
    {
      id: "2",
      name: "Newcomer Employment Centre",
      category: "Jobs",
      location: "London",
      description: "Provides beginner-friendly employment support."
    },
    {
      id: "3",
      name: "Affordable Housing Support",
      category: "Accommodation",
      location: "Birmingham",
      description: "Provides information about affordable accommodation."
    }
  ];

  const serviceId = event.pathParameters?.id;
  const query = event.queryStringParameters || {};

  let results = services;

  // Return one service when /services/{id} is requested
  if (serviceId) {
    results = services.filter((service) => service.id === serviceId);
  }

  // Basic optional filtering for /services
  if (query.category) {
    results = results.filter(
      (service) =>
        service.category.toLowerCase() === query.category.toLowerCase()
    );
  }

  if (query.location) {
    results = results.filter(
      (service) =>
        service.location.toLowerCase() === query.location.toLowerCase()
    );
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin":
        process.env.CORS_ALLOWED_ORIGIN || "*"
    },
    body: JSON.stringify({
      message: "HelpIn Search Function is working",
      count: results.length,
      services: results
    })
  };
};
