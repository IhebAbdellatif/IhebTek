// netlify/functions/check-login.js
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}');

    // ✅ Your credentials
    const auth = username === 'reboot' && password === 'IhebAbdellatif';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth })
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request' })
    };
  }
};