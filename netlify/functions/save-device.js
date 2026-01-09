// netlify/functions/save-device.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

const SHEET_ID = '11KL_-waNbU7IU7kaGDKTw-Xy6j5YaBBnSZ044QrJwFM';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // 🔑 Get service account from Netlify environment variable
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth(serviceAccount);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['device submission'];
    if (!sheet) {
      throw new Error('Sheet not found');
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, id: nextId })
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};