// netlify/functions/test-env.js
exports.handler = async () => {
  const hasKey = !!process.env.GOOGLE_SERVICE_ACCOUNT;
  const keyPreview = hasKey 
    ? process.env.GOOGLE_SERVICE_ACCOUNT.substring(0, 50) + '...' 
    : 'MISSING';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      has_GOOGLE_SERVICE_ACCOUNT: hasKey,
      preview: keyPreview
    }, null, 2)
  };
};
