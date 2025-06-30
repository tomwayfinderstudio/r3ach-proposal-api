import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Main API handler
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Add CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { method, url } = req;
  const urlPath = new URL(url, `http://${req.headers.host}`).pathname;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res, urlPath);
      case 'POST':
        return await handlePost(req, res, urlPath);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// GET request handlers
async function handleGet(req, res, path) {
  const { query } = req;

  switch (path) {
    case '/api/clients':
      const { data: clients, error: clientError } = await supabase
        .from('cached_clients')
        .select('*')
        .order('last_synced', { ascending: false })
        .limit(50);
      
      if (clientError) throw clientError;
      
      return res.json({ 
        success: true, 
        data: clients || [],
        count: clients?.length || 0
      });

    case '/api/creators':
      let creatorQuery = supabase
        .from('cached_creators')
        .select('*');

      // Apply filters if provided
      if (query.managementStatus) {
        creatorQuery = creatorQuery.eq('management_status', query.managementStatus);
      }
      if (query.pricingTier) {
        creatorQuery = creatorQuery.eq('pricing_tier', query.pricingTier);
      }
      if (query.search) {
        creatorQuery = creatorQuery.or(`name.ilike.%${query.search}%,niche_focus.ilike.%${query.search}%`);
      }

      const { data: creators, error: creatorError } = await creatorQuery
        .order('monthly_impressions', { ascending: false })
        .limit(100);

      if (creatorError) throw creatorError;

      return res.json({ 
        success: true, 
        data: creators || [],
        count: creators?.length || 0
      });

    case '/api/templates':
      const { data: templates, error: templateError } = await supabase
        .from('cached_templates')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(20);

      if (templateError) throw templateError;

      return res.json({ 
        success: true, 
        data: templates || [],
        count: templates?.length || 0
      });

    case '/api/proposals':
      const { data: proposals, error: proposalError } = await supabase
        .from('user_proposals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (proposalError) throw proposalError;

      return res.json({ 
        success: true, 
        data: proposals || [],
        count: proposals?.length || 0
      });

    case '/api/health':
      return res.json({ 
        success: true, 
        message: 'R3ACH Proposal API is running!',
        timestamp: new Date().toISOString()
      });

    default:
      return res.status(404).json({ error: 'Endpoint not found' });
  }
}

// POST request handlers
async function handlePost(req, res, path) {
  const { body } = req;

  switch (path) {
    case '/api/proposals/generate':
      try {
        // Call N8N webhook for AI generation
        const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId: body.clientId,
            campaignType: body.campaignType,
            budgetRange: body.budgetRange,
            selectedCreators: body.selectedCreators,
            templateId: body.templateId,
            requestId: Date.now().toString()
          })
        });

        if (!n8nResponse.ok) {
          throw new Error(`N8N webhook failed: ${n8nResponse.status}`);
        }

        const result = await n8nResponse.json();
        
        return res.json({
          success: true,
          message: 'Proposal generation started!',
          data: result
        });
      } catch (error) {
        console.error('N8N Error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to generate proposal',
          details: error.message
        });
      }

    case '/api/proposals':
      // Create manual proposal
      const { data: newProposal, error } = await supabase
        .from('user_proposals')
        .insert([{
          client_name: body.clientName,
          campaign_type: body.campaignType,
          budget_range: body.budgetRange,
          status: 'draft',
          selected_creators: body.sel
