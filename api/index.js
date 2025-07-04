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
  const endpoint = query.endpoint || query.path || url?.split('/').pop() || '';

  try {
    if (method === 'GET') {
      // Health endpoint
      if (endpoint === 'health' || url?.includes('health')) {
        return res.status(200).json({
          success: true,
          message: 'R3ACH Proposal API Health Check ✅',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          supabaseConnected: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
        });
      }

      // Clients endpoint - try Supabase first, fallback to demo data
      if (endpoint === 'clients' || url?.includes('clients')) {
        try {
          // Try to fetch from Supabase if credentials are available
          if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
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

            if (supabaseResponse.ok) {
              const clients = await supabaseResponse.json();
              if (clients && clients.length > 0) {
                return res.status(200).json({
                  success: true,
                  message: 'Clients loaded from Notion/Supabase',
                  data: clients,
                  source: 'supabase'
                });
              }
            }
          }

          // Fallback to demo data
          return res.status(200).json({
            success: true,
            message: 'Clients loaded (demo data)',
            data: [
              { id: '1', name: 'DeFi Protocol X', deal_value: 150000, status: 'Qualified', notion_id: 'demo-1' },
              { id: '2', name: 'NFT Marketplace Y', deal_value: 85000, status: 'Proposal Sent', notion_id: 'demo-2' },
              { id: '3', name: 'L2 Solution Z', deal_value: 300000, status: 'Discovery', notion_id: 'demo-3' }
            ],
            source: 'demo'
          });

        } catch (error) {
          console.error('Clients endpoint error:', error);
          // Always return demo data on error
          return res.status(200).json({
            success: true,
            message: 'Clients loaded (error fallback)',
            data: [
              { id: '1', name: 'DeFi Protocol X', deal_value: 150000, status: 'Qualified' },
              { id: '2', name: 'NFT Marketplace Y', deal_value: 85000, status: 'Proposal Sent' },
              { id: '3', name: 'L2 Solution Z', deal_value: 300000, status: 'Discovery' }
            ],
            source: 'error-fallback'
          });
        }
      }

      // Creators endpoint - try Supabase first, fallback to demo data
      if (endpoint === 'creators' || url?.includes('creators')) {
        try {
          if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            let supabaseQuery = `${process.env.SUPABASE_URL}/rest/v1/cached_creators?select=*&order=monthly_impressions.desc&limit=100`;
            
            // Add search filter if provided
            if (query.search) {
              supabaseQuery += `&or=(name.ilike.*${query.search}*,niche_focus.ilike.*${query.search}*)`;
            }

            const supabaseResponse = await fetch(supabaseQuery, {
              headers: {
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
              }
            });

            if (supabaseResponse.ok) {
              const creators = await supabaseResponse.json();
              if (creators && creators.length > 0) {
                return res.status(200).json({
                  success: true,
                  message: 'Creators loaded from Notion/Supabase',
                  data: creators,
                  source: 'supabase'
                });
              }
            }
          }

          // Fallback to demo data
          return res.status(200).json({
            success: true,
            message: 'Creators loaded (demo data)',
            data: [
              { 
                id: '1', 
                name: 'CryptoInfluencer1', 
                management_status: 'Full Management', 
                pricing_tier: '$$$', 
                monthly_impressions: 2500000,
                content_types: ['𝕏 Posts', 'Spaces', 'Videos'],
                notion_id: 'demo-c1'
              },
              { 
                id: '2', 
                name: 'DeFiExpert2', 
                management_status: 'R3ACH NTWRK', 
                pricing_tier: '$$', 
                monthly_impressions: 1200000,
                content_types: ['𝕏 Posts', 'Threads'],
                notion_id: 'demo-c2'
              },
              { 
                id: '3', 
                name: 'Web3Educator3', 
                management_status: 'Full Management', 
                pricing_tier: '$$', 
                monthly_impressions: 800000,
                content_types: ['Videos', 'Livestreams'],
                notion_id: 'demo-c3'
              }
            ],
            source: 'demo'
          });

        } catch (error) {
          console.error('Creators endpoint error:', error);
          return res.status(200).json({
            success: true,
            message: 'Creators loaded (error fallback)',
            data: [
              { id: '1', name: 'CryptoInfluencer1', management_status: 'Full Management', pricing_tier: '$$$', monthly_impressions: 2500000 },
              { id: '2', name: 'DeFiExpert2', management_status: 'R3ACH NTWRK', pricing_tier: '$$', monthly_impressions: 1200000 }
            ],
            source: 'error-fallback'
          });
        }
      }

      // Templates endpoint - try Supabase first, fallback to demo data
      if (endpoint === 'templates' || url?.includes('templates')) {
        try {
          if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
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

            if (supabaseResponse.ok) {
              const templates = await supabaseResponse.json();
              if (templates && templates.length > 0) {
                return res.status(200).json({
                  success: true,
                  message: 'Templates loaded from Notion/Supabase',
                  data: templates,
                  source: 'supabase'
                });
              }
            }
          }

          // Fallback to demo data
          return res.status(200).json({
            success: true,
            message: 'Templates loaded (demo data)',
            data: [
              { 
                id: '1', 
                name: 'Product Launch Template', 
                template_type: ['Awareness', 'Adoption', 'Community'],
                usage_count: 12,
                notion_id: 'demo-t1'
              },
              { 
                id: '2', 
                name: 'Ambassador Program Template', 
                template_type: ['Long-term', 'Community', 'Loyalty'],
                usage_count: 8,
                notion_id: 'demo-t2'
              },
              { 
                id: '3', 
                name: 'Narrative Campaign Template', 
                template_type: ['Thought Leadership', 'Educational'],
                usage_count: 15,
                notion_id: 'demo-t3'
              }
            ],
            source: 'demo'
          });

        } catch (error) {
          console.error('Templates endpoint error:', error);
          return res.status(200).json({
            success: true,
            message: 'Templates loaded (error fallback)',
            data: [
              { id: '1', name: 'Product Launch Template', template_type: ['Awareness', 'Adoption'] },
              { id: '2', name: 'Ambassador Program Template', template_type: ['Long-term', 'Community'] }
            ],
            source: 'error-fallback'
          });
        }
      }

      // Test endpoint
      if (endpoint === 'test' || url?.includes('test')) {
        return res.status(200).json({
          success: true,
          message: 'Test endpoint working! 🚀',
          timestamp: new Date().toISOString(),
          environment: {
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
          }
        });
      }

      // Default GET response
      return res.status(200).json({
        success: true,
        message: 'R3ACH Proposal API is working!',
        endpoints: ['health', 'clients', 'creators', 'templates', 'generate'],
        timestamp: new Date().toISOString()
      });
    }

    // Handle POST requests
    if (method === 'POST') {
      if (endpoint === 'generate' || url?.includes('generate')) {
        const body = req.body || {};

        // Simple validation
        if (!body.clientName) {
          return res.status(400).json({
            success: false,
            error: 'Client name is required'
          });
        }

        // Generate demo proposal
        const proposalId = `proposal-${Date.now()}`;
        
        const demoProposal = {
          proposalId: proposalId,
          content: `# ${body.campaignType || 'Marketing'} Proposal for ${body.clientName}

## 📋 Executive Summary

R3ACH presents this comprehensive proposal for ${body.clientName}. Our strategic approach leverages premium creators to deliver exceptional Web3 marketing results.

**Campaign Overview:**
- **Budget:** ${body.budgetRange || '$100K-$200K'}
- **Duration:** 6-8 weeks
- **Creators:** ${body.selectedCreators?.length || 0} premium influencers
- **Expected Reach:** 2-5M impressions

## ✅ Campaign Objectives

- Drive awareness and adoption for ${body.clientName}
- Generate high-quality engagement across target demographics
- Build sustainable community growth
- Establish thought leadership in Web3
- Achieve measurable ROI through strategic partnerships

## 💭 Content Strategy

### Phase 1: Foundation (Weeks 1-2)
Premium creators establish credibility through:
- Educational content series
- Thought leadership positioning
- Community engagement initiatives

### Phase 2: Amplification (Weeks 3-4)
Mid-tier creators amplify messaging with:
- Platform-specific content optimization
- Cross-promotional campaigns
- Interactive community events

### Phase 3: Conversion (Weeks 5-6)
Conversion-focused creators drive actions through:
- Product demonstrations
- Community activation campaigns
- Performance optimization

## 🔍 Expected Results

Based on similar campaigns:
- **Reach:** 2.5M+ targeted impressions
- **Engagement:** 150K+ interactions
- **Click-through Rate:** 3-5%
- **Community Growth:** 25%+ increase
- **ROI:** 300-500%

## 👥 Investment Breakdown

**Total Investment:** ${body.budgetRange || '$100K-$200K'}
- Tier 1 Creators (Premium): 40%
- Tier 2 Creators (Amplification): 35%
- Tier 3 Creators (Conversion): 20%
- Campaign Management: 5%

---
*Generated by R3ACH AI System*
*Proposal ID: ${proposalId}*
*Generated: ${new Date().toLocaleString()}*`,
          metadata: {
            tokensUsed: 2847,
            clientName: body.clientName,
            creatorCount: body.selectedCreators?.length || 0,
            generationTime: new Date().toISOString(),
            model: 'demo-mode',
            templateUsed: body.templateId || 'default'
          }
        };

        return res.status(200).json({
          success: true,
          message: 'Proposal generated successfully!',
          data: demoProposal
        });
      }

      return res.status(200).json({
        success: true,
        message: 'POST endpoint working'
      });
    }

    // Handle other methods
    return res.status(405).json({
      error: 'Method not allowed',
      method: method
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
