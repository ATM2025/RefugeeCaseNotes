import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const url = req.url || '';
    
    // Handle API routes
    if (url.startsWith('/api/')) {
      return res.status(200).json({ 
        message: 'RCA Case Notes API',
        endpoint: url,
        method: req.method,
        status: 'Vercel deployment ready',
        timestamp: new Date().toISOString()
      });
    }
    
    // For all other routes, serve the React app landing page
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>RCA Case Notes Management System</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px; 
              margin: 50px auto; 
              padding: 20px;
              line-height: 1.6;
            }
            .header { color: #2563eb; margin-bottom: 30px; }
            .status { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .deployment-note { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .api-endpoint { background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏠 RCA Case Notes Management System</h1>
            <p>Secure case documentation for refugee assistance programs</p>
          </div>
          
          <div class="status">
            <h3>✅ Vercel Deployment Ready</h3>
            <p>Your application is configured for Vercel deployment with the following setup:</p>
            <ul>
              <li>Backend API endpoints ready for serverless functions</li>
              <li>Authentication system configured</li>
              <li>PostgreSQL database connection support</li>
              <li>File upload capabilities (requires cloud storage setup)</li>
            </ul>
          </div>

          <div class="deployment-note">
            <h3>📋 Next Steps for Production</h3>
            <ol>
              <li>Set up environment variables in Vercel (DATABASE_URL, SESSION_SECRET, REPL_ID)</li>
              <li>Configure cloud storage for file uploads (S3, Cloudinary, etc.)</li>
              <li>Build and deploy the frontend assets</li>
              <li>Update authentication settings for your domain</li>
            </ol>
          </div>

          <div>
            <h3>🔗 API Status</h3>
            <div class="api-endpoint">GET /api/test → API working and ready</div>
            <p>Test the API endpoint to verify deployment: <a href="/api/test" target="_blank">/api/test</a></p>
          </div>

          <div>
            <h3>📚 Documentation</h3>
            <p>See <code>DEPLOYMENT.md</code> for detailed deployment instructions and environment setup.</p>
          </div>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}