// netlify/functions/test-env.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async () => {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const doc = new GoogleSpreadsheet('11KL_-waNbU7IU7kaGDKTw-Xy6j5YaBBnSZ044QrJwFM', serviceAccount);
    
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
        error: error.message
      }, null, 2)
    };
  }
};
