export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, url } = req;
  
  // Get endpoint from query parameter or URL path
  const endpoint = query.endpoint || query.path || url?.split('/').pop() || '';
  
  console.log('Request:', method, url, 'endpoint:', endpoint, 'query:', query);

  if (method === 'GET') {
    // Health endpoint
    if (endpoint === 'health' || url?.includes('health')) {
      return res.status(200).json({
        success: true,
        message: 'R3ACH Proposal API Health Check ✅',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: 'production',
        uptime: process.uptime() + ' seconds',
        supabaseConnected: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
        n8nWebhookConfigured: !!process.env.N8N_WEBHOOK_URL
      });
    }

    // Clients endpoint - fetch from Supabase
    if (endpoint === 'clients' || url?.includes('clients')) {
      try {
        // Check if Supabase credentials are available
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          return res.status(200).json({
            success: true,
            message: 'Clients endpoint ready - Supabase credentials needed',
            data: [],
            note: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables'
          });
        }

        // Fetch from Supabase
        const supabaseResponse = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/cached_clients?select=*&order=last_synced.desc&limit=50`,
          {
            headers: {
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!supabaseResponse.ok) {
          console.error('Supabase error:', supabaseResponse.status, supabaseResponse.statusText);
          
          // Return sample data as fallback
          return res.status(200).json({
            success: true,
            message: 'Clients loaded (fallback data)',
            data: [
              { id: '1', name: 'DeFi Protocol X', deal_value: 150000, status: 'Qualified', notion_id: 'sample-1' },
              { id: '2', name: 'NFT Marketplace Y', deal_value: 85000, status: 'Proposal Sent', notion_id: 'sample-2' },
              { id: '3', name: 'L2 Solution Z', deal_value: 300000, status: 'Discovery', notion_id: 'sample-3' }
            ],
            note: 'Using sample data - check Supabase connection'
          });
        }

        const clients = await supabaseResponse.json();
        console.log('Supabase clients response:', clients);

        return res.status(200).json({
          success: true,
          message: 'Clients loaded from Supabase',
          data: clients || [],
          count: clients?.length || 0,
          source: 'supabase'
        });

      } catch (error) {
        console.error('Error fetching clients:', error);
        
        // Return sample data as fallback
        return res.status(200).json({
          success: true,
          message: 'Clients loaded (error fallback)',
          data: [
            { id: '1', name: 'DeFi Protocol X', deal_value: 150000, status: 'Qualified', notion_id: 'sample-1' },
            { id: '2', name: 'NFT Marketplace Y', deal_value: 85000, status: 'Proposal Sent', notion_id: 'sample-2' },
            { id: '3', name: 'L2 Solution Z', deal_value: 300000, status: 'Discovery', notion_id: 'sample-3' }
          ],
          error: error.message,
          note: 'Using sample data due to error'
        });
      }
    }

    // Creators endpoint - fetch from Supabase
    if (endpoint === 'creators' || url?.includes('creators')) {
      try {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          return res.status(200).json({
            success: true,
            message: 'Creators endpoint ready - Supabase credentials needed',
            data: [],
            note: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables'
          });
        }

        // Build query with filters
        let supabaseQuery = `${process.env.SUPABASE_URL}/rest/v1/cached_creators?select=*&order=monthly_impressions.desc&limit=100`;
        
        // Add filters if provided
        if (query.search) {
          supabaseQuery += `&or=(name.ilike.*${query.search}*,niche_focus.ilike.*${query.search}*)`;
        }
        if (query.managementStatus) {
          supabaseQuery += `&management_status=eq.${query.managementStatus}`;
        }
        if (query.pricingTier) {
          supabaseQuery += `&pricing_tier=eq.${query.pricingTier}`;
        }

        const supabaseResponse = await fetch(supabaseQuery, {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!supabaseResponse.ok) {
          console.error('Supabase creators error:', supabaseResponse.status);
          
          return res.status(200).json({
            success: true,
            message: 'Creators loaded (fallback data)',
            data: [
              { id: '1', name: 'CryptoInfluencer1', management_status: 'Full Management', pricing_tier: '$$$', monthly_impressions: 2500000, notion_id: 'sample-c1' },
              { id: '2', name: 'DeFiExpert2', management_status: 'R3ACH NTWRK', pricing_tier: '$$', monthly_impressions: 1200000, notion_id: 'sample-c2' }
            ],
            note: 'Using sample data - check Supabase connection'
          });
        }

        const creators = await supabaseResponse.json();
        console.log('Supabase creators response:', creators);

        return res.status(200).json({
          success: true,
          message: 'Creators loaded from Supabase',
          data: creators || [],
          count: creators?.length || 0,
          source: 'supabase'
        });

      } catch (error) {
        console.error('Error fetching creators:', error);
        
        return res.status(200).json({
          success: true,
          message: 'Creators loaded (error fallback)',
          data: [
            { id: '1', name: 'CryptoInfluencer1', management_status: 'Full Management', pricing_tier: '$$$', monthly_impressions: 2500000 },
            { id: '2', name: 'DeFiExpert2', management_status: 'R3ACH NTWRK', pricing_tier: '$$', monthly_impressions: 1200000 }
          ],
          error: error.message,
          note: 'Using sample data due to error'
        });
      }
    }

    // Templates endpoint - fetch from Supabase
    if (endpoint === 'templates' || url?.includes('templates')) {
      try {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          return res.status(200).json({
            success: true,
            message: 'Templates endpoint ready - Supabase credentials needed',
            data: [],
            note: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables'
          });
        }

        const supabaseResponse = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/cached_templates?select=*&order=usage_count.desc&limit=20`,
          {
            headers: {
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!supabaseResponse.ok) {
          console.error('Supabase templates error:', supabaseResponse.status);
          
          return res.status(200).json({
            success: true,
            message: 'Templates loaded (fallback data)',
            data: [
              { id: '1', name: 'DeFi Product Launch Template', template_type: ['Product', 'Launch'], notion_id: 'sample-t1' },
              { id: '2', name: 'Ambassador Program Template', template_type: ['Ambassador', 'Long-term'], notion_id: 'sample-t2' }
            ],
            note: 'Using sample data - check Supabase connection'
          });
        }

        const templates = await supabaseResponse.json();
        console.log('Supabase templates response:', templates);

        return res.status(200).json({
          success: true,
          message: 'Templates loaded from Supabase',
          data: templates || [],
          count: templates?.length || 0,
          source: 'supabase'
        });

      } catch (error) {
        console.error('Error fetching templates:', error);
        
        return res.status(200).json({
          success: true,
          message: 'Templates loaded (error fallback)',
          data: [
            { id: '1', name: 'DeFi Product Launch Template', template_type: ['Product', 'Launch'] },
            { id: '2', name: 'Ambassador Program Template', template_type: ['Ambassador', 'Long-term'] }
          ],
          error: error.message,
          note: 'Using sample data due to error'
        });
      }
    }

    // Test endpoint
    if (endpoint === 'test' || url?.includes('test')) {
      return res.status(200).json({
        success: true,
        message: 'Test endpoint working perfectly! 🚀',
        method: method,
        url: url,
        query: query,
        timestamp: new Date().toISOString(),
        environment: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          hasN8nWebhook: !!process.env.N8N_WEBHOOK_URL,
          nodeEnv: process.env.NODE_ENV || 'production'
        }
      });
    }

    // Root API endpoint - show available endpoints
    return res.status(200).json({
      success: true,
      message: '🎉 R3ACH Proposal API is working perfectly!',
      version: '1.0.0',
      status: 'ready',
      supabaseConnected: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      n8nWebhookConfigured: !!process.env.N8N_WEBHOOK_URL,
      howToUse: {
        method1: 'Direct paths like /api/health',
        method2: 'Query parameters like /api?endpoint=health'
      },
      availableEndpoints: {
        health: {
          url: '/api/health',
          alternativeUrl: '/api?endpoint=health',
          description: 'API health check'
        },
        clients: {
          url: '/api/clients',
          alternativeUrl: '/api?endpoint=clients',
          description: 'Client data from Supabase/Notion'
        },
        creators: {
          url: '/api/creators',
          alternativeUrl: '/api?endpoint=creators',
          description: 'Creator data from Supabase/Notion'
        },
        templates: {
          url: '/api/templates',
          alternativeUrl: '/api?endpoint=templates',
          description: 'Template data from Supabase/Notion'
        },
        generate: {
          url: '/api?path=generate',
          method: 'POST',
          description: 'AI proposal generation endpoint'
        }
      },
      debug: {
        currentUrl: url,
        method: method,
        query: query,
        detectedEndpoint: endpoint,
        environment: process.env.NODE_ENV || 'production'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle POST requests - Proposal Generation
  if (method === 'POST') {
    console.log('POST request received, endpoint:', endpoint);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Proposal generation endpoint
    if (endpoint === 'generate' || url?.includes('generate')) {
      try {
        const body = req.body || {};
        
        console.log('Processing proposal generation...');
        console.log('Client Name:', body.clientName);
        console.log('Campaign Type:', body.campaignType);
        console.log('Selected Creators:', body.selectedCreators);

        // Simple validation
        if (!body.clientName) {
          return res.status(400).json({
            success: false,
            error: 'Client name is required'
          });
        }

        if (!body.campaignType) {
          return res.status(400).json({
            success: false,
            error: 'Campaign type is required'
          });
        }

        // Generate a demo proposal (since N8N isn't set up yet)
        const proposalId = `proposal-${Date.now()}`;
        
        console.log('Generating demo proposal with ID:', proposalId);

        const demoProposal = {
          proposalId: proposalId,
          content: `# ${body.campaignType} Proposal for ${body.clientName}

## 📋 Executive Summary

R3ACH is excited to present this comprehensive ${body.campaignType.toLowerCase()} proposal for ${body.clientName}. Our strategic approach leverages our premium creator network to deliver exceptional results for your Web3 marketing campaign.

**Campaign Overview:**
- **Budget:** ${body.budgetRange || 'TBD'}
- **Duration:** 6-8 weeks
- **Creators:** ${body.selectedCreators?.length || 0} premium influencers
- **Expected Reach:** 2-5M impressions

## ✅ Campaign Objectives

- Drive awareness and adoption for ${body.clientName}
- Generate high-quality engagement across target demographics  
- Build sustainable community growth
- Establish thought leadership in the Web3 space
- Achieve measurable ROI through strategic creator partnerships

## 💭 Content Strategy & Creator Deployment

### Phase 1: Foundation Building (Weeks 1-2)
Our premium creators will establish narrative credibility and introduce core value propositions through:
- Educational content series
- Thought leadership positioning
- Community engagement initiatives

### Phase 2: Amplification (Weeks 3-4) 
Mid-tier creators amplify messaging across diverse audiences with:
- Platform-specific content optimization
- Cross-promotional campaigns
- Interactive community events

### Phase 3: Conversion Focus (Weeks 5-6)
Conversion-optimized creators drive specific actions through:
- Product demonstrations and tutorials
- Community activation campaigns
- Performance optimization based on real-time analytics

## 🔍 Expected Results & ROI

Based on similar campaigns, we project:
- **Reach:** 2.5M+ targeted impressions
- **Engagement:** 150K+ interactions
- **Click-through Rate:** 3-5%
- **Community Growth:** 25%+ increase
- **ROI:** 300-500% based on campaign objectives

## 👥 Creator Investment Breakdown

**Total Investment:** ${body.budgetRange || '$100K-$200K'}

- **Tier 1 Creators (Premium):** 40% of budget
- **Tier 2 Creators (Amplification):** 35% of budget  
- **Tier 3 Creators (Conversion):** 20% of budget
- **Campaign Management & Analytics:** 5% of budget

---

**Generated by R3ACH AI Proposal System**
*Proposal ID: ${proposalId}*
*Generated: ${new Date().toLocaleString()}*`,
          metadata: {
            tokensUsed: 2847,
            clientName: body.clientName,
            creatorCount: body.selectedCreators?.length || 0,
            generationTime: new Date().toISOString(),
            model: 'demo-mode',
            templateUsed: body.templateId || 'default',
            budgetRange: body.budgetRange,
            campaignType: body.campaignType
          }
        };

        console.log('Demo proposal generated successfully');

        return res.status(200).json({
          success: true,
          message: 'Proposal generated successfully!',
          data: demoProposal,
          note: 'Demo mode - Real AI generation coming soon!'
        });

      } catch (error) {
        console.error('Proposal generation error:', error);
        
        return res.status(500).json({
          success: false,
          error: 'Internal server error during proposal generation',
          details: error.message,
          stack: error.stack
        });
      }
    }

    // Default POST response
    return res.status(200).json({
      success: true,
      message: 'POST request received',
      endpoint: endpoint,
      body: req.body
    });
  }
