export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle different endpoints
  const { method, url } = req;

  if (method === 'GET') {
    if (url === '/api/health' || url.endsWith('/health')) {
      return res.status(200).json({
        success: true,
        message: 'R3ACH Proposal API is working!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    }

    if (url === '/api/test' || url.endsWith('/test')) {
      return res.status(200).json({
        success: true,
        message: 'Test endpoint working!',
        method: method,
        url: url
      });
    }

    // Default response for any GET request
    return res.status(200).json({
      success: true,
      message: 'R3ACH Proposal API',
      availableEndpoints: ['/api/health', '/api/test'],
      method: method,
      url: url
    });
  }

  // Handle other methods
  return res.status(405).json({
    error: 'Method not allowed',
    method: method
  });
}
