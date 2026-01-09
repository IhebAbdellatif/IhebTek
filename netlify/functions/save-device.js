// netlify/functions/save-device.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

// ✅ NEW SHEET ID
const SHEET_ID = '1WGFJFwxzt3KsBQE4-cRk-Zoj_RHi2zyEUbZWK6BhogA';
const SHEET_NAME = 'device submission';

exports.handler = async (event) => {
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

    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      console.error('GOOGLE_SERVICE_ACCOUNT env var is missing');
      return safeJsonResponse(500, { success: false, error: 'Google credentials missing' });
    }

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    // ✅ CORRECT AUTH FOR v4+
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccount);
    await doc.loadInfo();

    // ✅ Ensure tab is named "device submission"
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
      'Nom du client': data.clientName,
      'Téléphone': data.phone,
      'Email': data.email || '',
      'Type': data.deviceType,
      'Marque': data.brand,
      'Modèle': data.model || '',
      'Date/Heure': data.datetime,
      'Problème': problem,
      'Description': data.description || '',
      'Paiement (Oui/Non)': data.payment,
      'Réparé (Oui/Non)': data.repaired
    });

    return safeJsonResponse(200, { success: true, id: nextId });
  } catch (error) {
    console.error('Save-device error:', error.message);
    return safeJsonResponse(500, {
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};
