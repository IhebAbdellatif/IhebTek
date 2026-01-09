// netlify/functions/debug-sheet.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async () => {
  try {
    const creds = {
      type: 'oauth',
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    };
    const doc = new GoogleSpreadsheet('1WGFJFwxzt3KsBQE4-cRk-Zoj_RHi2zyEUbZWK6BhogA', creds);
    await doc.loadInfo();
    return { statusCode: 200, body: JSON.stringify({ success: true, title: doc.title }) };
  } catch (error) {
    return { statusCode: 200, body: JSON.stringify({ success: false, error: error.message }) };
  }
};
