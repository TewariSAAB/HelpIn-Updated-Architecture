exports.handler = async (event) => {
  const origin = process.env.CORS_ALLOWED_ORIGIN || '*';
  const groups = event?.requestContext?.authorizer?.claims?.['cognito:groups'] || '';
  const requiredGroup = process.env.REQUIRED_ADMIN_GROUP || 'Admin';
  const groupList = groups ? groups.split(',') : [];

  if (!groupList.includes(requiredGroup)) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin
      },
      body: JSON.stringify({ message: 'Admin access is required' })
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin
    },
    body: JSON.stringify({
      message: 'HelpIn AdminFunction is deployed',
      method: event.httpMethod,
      path: event.path
    })
  };
};
