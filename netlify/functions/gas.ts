const DEFAULT_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzyJE21jeRLP-9ZIjjpJsm0SoSsdIluEGu0Ma0GR8jH93aD-3B9qCbOQxFeNrFMrrygnA/exec";

export const handler = async (event: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-gas-url',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const customHeaderUrl = event.headers['x-gas-url'] || event.headers['X-Gas-Url'];
    const targetUrl = customHeaderUrl || process.env.VITE_GAS_URL || process.env.GAS_URL || DEFAULT_SHEETS_URL;

    let requestBody = event.body || '{}';
    if (event.isBase64Encoded) {
      requestBody = Buffer.from(requestBody, 'base64').toString('utf-8');
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
      redirect: 'follow'
    });

    const responseText = await response.text();

    return {
      statusCode: response.status || 200,
      headers,
      body: responseText
    };
  } catch (err: any) {
    console.error('[NETLIFY GAS ERROR]', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message || 'Proxy error' })
    };
  }
};
