// Simple test version - replace your api/index.js with this temporarily

export default function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  const { method, url } = req;

  if (method === 'GET' && url === '/api/health') {
    return res.status(200).json({
      success: true,
      message: 'R3ACH Proposal API is working!',
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  }

  return res.status(404).json({
    error: 'Endpoint not found',
    method: method,
    url: url
  });
}
