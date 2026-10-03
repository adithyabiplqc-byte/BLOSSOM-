const DEFAULT_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzyJE21jeRLP-9ZIjjpJsm0SoSsdIluEGu0Ma0GR8jH93aD-3B9qCbOQxFeNrFMrrygnA/exec";
const DEFAULT_DRIVE_URL = "https://script.google.com/macros/s/AKfycbyKWMLBVEs8L_5K-j4COuyNUGxngjs0NlG2Um3RuXwZZmIM5-lAof3sEfONj581y-lJ/exec";

export const handler = async (event: any) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const gasUrl = process.env.VITE_GAS_URL || process.env.GAS_URL || DEFAULT_SHEETS_URL;
  const gasDriveUrl = process.env.VITE_GAS_DRIVE_URL || process.env.GAS_DRIVE_URL || DEFAULT_DRIVE_URL;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      hasGasUrl: true,
      isPermanent: true,
      gasUrl,
      gasDriveUrl,
      spreadsheetId: process.env.GOOGLE_SHEETS_ID || "BOUND_TO_SCRIPT",
      source: "netlify"
    })
  };
};
