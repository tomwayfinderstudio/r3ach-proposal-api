// Ultra simple API - CommonJS format

function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  const { method, url } = req;

  if (method === 'GET' && url.includes('/api/health')) {
    return res.status(200).json({
      success: true,
      message: 'R3ACH Proposal API is working!',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(200).json({
    success: true,
    message: 'API is working!',
    method: method,
    url: url,
    note: 'This is a test response'
  });
}

module.exports = handler;
