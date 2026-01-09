// netlify/functions/debug-sheet.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

// ✅ NEW SHEET ID
const SHEET_ID = '1WGFJFwxzt3KsBQE4-cRk-Zoj_RHi2zyEUbZWK6BhogA';

exports.handler = async () => {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccount);
    
    await doc.loadInfo();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        title: doc.title,
        sheets: Object.keys(doc.sheetsByTitle)
      }, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack ? error.stack.split('\n')[0] : 'no stack'
      }, null, 2)
    };
  }
};
