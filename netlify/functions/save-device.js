// netlify/functions/save-device.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

const SHEET_ID = '1WGFJFwxzt3KsBQE4-cRk-Zoj_RHi2zyEUbZWK6BhogA';

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
    // ✅ OAuth2 credentials for google-spreadsheet v4+
    const creds = {
      type: 'oauth',
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    };

    // ✅ Pass creds directly to constructor
    const doc = new GoogleSpreadsheet(SHEET_ID, creds);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0]; // Use first sheet

    const rows = await sheet.getRows();
    let maxId = 0;
    for (const row of rows) {
      const id = parseInt(row._rawData[0], 10);
      if (!isNaN(id) && id > maxId) maxId = id;
    }
    const nextId = maxId + 1;

    const data = JSON.parse(event.body || '{}');
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
    console.error('Error:', error.message);
    return safeJsonResponse(500, { success: false, error: error.message });
  }
};
