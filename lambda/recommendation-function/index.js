exports.handler = async (event) => {
  const origin = process.env.CORS_ALLOWED_ORIGIN || '*';
  const filters = event.queryStringParameters || {};

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin
    },
    body: JSON.stringify({
      message: 'HelpIn RecommendationFunction is deployed',
      recommendationCriteria: filters
    })
  };
};
