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
    const data = JSON.parse(event.body || '{}');

    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      return safeJsonResponse(500, { success: false, error: 'Google credentials missing' });
    }

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccount);
    await doc.loadInfo();

    // ✅ Use first sheet if "device submission" not found
    let sheet = doc.sheetsByTitle['device submission'];
    if (!sheet) {
      const sheetList = Object.keys(doc.sheetsByTitle);
      if (sheetList.length === 0) {
        return safeJsonResponse(400, { success: false, error: 'No sheets found' });
      }
      sheet = doc.sheetsByTitle[sheetList[0]]; // Use first sheet
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
    console.error('Error:', error.message);
    return safeJsonResponse(500, { success: false, error: error.message });
  }
};
