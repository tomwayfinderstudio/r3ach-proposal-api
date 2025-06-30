export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the path from the URL
  const { method, query } = req;
  const path = req.url || '';

  console.log('Request:', method, path); // For debugging

  if (method === 'GET') {
    // Health endpoint
    if (path.includes('health')) {
      return res.status(200).json({
        success: true,
        message: 'R3ACH Proposal API is working!',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        path: path
      });
    }

    // Test endpoint
    if (path.includes('test')) {
      return res.status(200).json({
        success: true,
        message: 'Test endpoint working!',
        method: method,
        path: path,
        timestamp: new Date().toISOString()
      });
    }

    // Clients endpoint (future)
    if (path.includes('clients')) {
      return res.status(200).json({
        success: true,
        message: 'Clients endpoint ready',
        data: [],
        note: 'Supabase integration coming next'
      });
    }

    // Creators endpoint (future)
    if (path.includes('creators')) {
      return res.status(200).json({
        success: true,
        message: 'Creators endpoint ready',
        data: [],
        note: 'Supabase integration coming next'
      });
    }

    // Templates endpoint (future)
    if (path.includes('templates')) {
      return res.status(200).json({
        success: true,
        message: 'Templates endpoint ready',
        data: [],
        note: 'Supabase integration coming next'
      });
    }

    // Root API endpoint - show available endpoints
    return res.status(200).json({
      success: true,
      message: 'R3ACH Proposal API',
      version: '1.0.0',
      availableEndpoints: {
        health: '/api/health',
        test: '/api/test',
        clients: '/api/clients (coming soon)',
        creators: '/api/creators (coming soon)',
        templates: '/api/templates (coming soon)'
      },
      currentPath: path,
      method: method,
      timestamp: new Date().toISOString()
    });
  }

  // Handle other methods
  return res.status(405).json({
    error: 'Method not allowed',
    method: method,
    allowedMethods: ['GET', 'POST', 'OPTIONS']
  });
}
