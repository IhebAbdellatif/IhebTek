// netlify/functions/save-device.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

const SHEET_ID = '11KL_-waNbU7IU7kaGDKTw-Xy6j5YaBBnSZ044QrJwFM';
const SHEET_NAME = 'device submission';

exports.handler = async (event) => {
  // Always return valid JSON, even on error
  const safeJsonResponse = (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (event.httpMethod !== 'POST') {
    return safeJsonResponse(405, { success: false, error: 'Method not allowed' });
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // Ensure Google service account is set
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      console.error('GOOGLE_SERVICE_ACCOUNT env var is missing');
      return safeJsonResponse(500, { success: false, error: 'Server misconfiguration' });
    }

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth(serviceAccount);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[SHEET_NAME];
    if (!sheet) {
      const msg = `Sheet "${SHEET_NAME}" not found. Available: ${Object.keys(doc.sheetsByTitle).join(', ')}`;
      console.error(msg);
      return safeJsonResponse(400, { success: false, error: msg });
    }

    // Get next ID
    const rows = await sheet.getRows();
    let maxId = 0;
    for (const row of rows) {
      const id = parseInt(row._rawData[0], 10);
      if (!isNaN(id) && id > maxId) maxId = id;
    }
    const nextId = maxId + 1;

    const problem = (data.problemHardware || 'Aucun') + ' / ' + (data.problemSoftware || 'Aucun');

    await sheet.addRow({
      'ID': nextId,
      'Client Name': data.clientName,
      'Phone': data.phone,
      'Email': data.email || '',
      'Device Type': data.deviceType,
      'Brand': data.brand,
      'Model': data.model || '',
      'Datetime': data.datetime,
      'Problem': problem,
      'Description': data.description || '',
      'Payment': data.payment,
      'Repaired': data.repaired
    });

    return safeJsonResponse(200, { success: true, id: nextId });
  } catch (error) {
    // Log full error for debugging
    console.error('Save-device error:', error.message, error.stack);

    // Return safe JSON error
    return safeJsonResponse(500, {
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};
