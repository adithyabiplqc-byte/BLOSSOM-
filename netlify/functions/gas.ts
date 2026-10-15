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
    const envGas = process.env.VITE_GAS_URL || process.env.GAS_URL;
    const targetUrl = customHeaderUrl || (envGas && !envGas.includes("AKfycbwK") && !envGas.includes("REPLACE_WITH") ? envGas : DEFAULT_SHEETS_URL);

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
    let finalBody = responseText;

    try {
      const parsedReq = JSON.parse(requestBody);
      if (parsedReq && parsedReq.action === 'api_getREPORTS_SOPData' && responseText.trim().startsWith('[')) {
        const list = JSON.parse(responseText);
        if (Array.isArray(list)) {
          const seenIds = new Set<string>();
          const seenDriveIds = new Set<string>();
          const seenSignatures = new Set<string>();
          const deduped: any[] = [];
          for (const item of list) {
            if (!item || typeof item !== 'object') continue;
            if (item.id === '__DELETED_SOP_IDS__') {
              deduped.push(item);
              continue;
            }
            const id = item.id ? String(item.id).trim().toLowerCase() : '';
            const driveId = item.driveFileId ? String(item.driveFileId).trim().toLowerCase() : '';
            const title = item.title ? String(item.title).trim().toLowerCase() : '';
            const attach = (item.attachmentUrl || item.attachmentName || '').trim().toLowerCase();
            const sig = `${title}:::${attach}`;

            if (id && seenIds.has(id)) continue;
            if (driveId && seenDriveIds.has(driveId)) continue;
            if (title && attach && seenSignatures.has(sig)) continue;

            if (id) seenIds.add(id);
            if (driveId) seenDriveIds.add(driveId);
            if (title && attach) seenSignatures.add(sig);
            deduped.push(item);
          }
          finalBody = JSON.stringify(deduped);
        }
      }
    } catch (e) {}

    return {
      statusCode: response.status || 200,
      headers,
      body: finalBody
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
