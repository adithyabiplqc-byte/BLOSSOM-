export const handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      status: "ok",
      environment: "netlify-functions",
      timestamp: new Date().toISOString()
    })
  };
};
