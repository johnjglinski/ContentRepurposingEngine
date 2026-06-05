// Appwrite function for sending emails via SendGrid
export default async ({ req, res, log, error }) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.send('', 204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Appwrite-Project'
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.json({ error: 'Method not allowed' }, 405);
  }

  try {
    // Parse request body
    const body = JSON.parse(req.body || '{}');
    const { email, posts } = body;

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return res.json(
        { error: 'Email is required and must be a valid string' },
        400
      );
    }

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.json(
        { error: 'Posts are required and must be a non-empty array' },
        400
      );
    }

    // Get SendGrid credentials from environment
    const sendGridSid = process.env.SENDGRID_SID;
    const sendGridSecret = process.env.SENDGRID_SECRET;
    const fromEmail = process.env.FROM_EMAIL || 'noreply@contentrepurposing.com';

    if (!sendGridSid || !sendGridSecret) {
      error('SendGrid credentials not configured');
      return res.json(
        { error: 'Email service not configured' },
        500
      );
    }

    log(`Sending email to: ${email}`);

    // Build email content
    const emailContent = {
      to: email,
      from: fromEmail,
      subject: 'Your Social Media Posts Are Ready! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Your Content Is Ready!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your social media posts have been generated successfully.</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">📱 Your Social Media Posts</h2>
            <p style="color: #666; margin: 10px 0;">Here are your optimized social media posts:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${posts.map((post, index) => `
                <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #667eea;">
                  <p style="margin: 0; color: #333; line-height: 1.5;">${post.replace(/\n/g, '<br>')}</p>
                </div>
              `).join('')}
            </div>
            
            <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">💡 Pro Tips</h3>
              <ul style="margin: 0; padding-left: 20px; color: #666;">
                <li>Schedule posts at optimal times for maximum engagement</li>
                <li>Add relevant hashtags to increase reach</li>
                <li>Include eye-catching visuals with your posts</li>
                <li>Engage with comments to boost visibility</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                Made with ❤️ by Content Repurposing Engine<br/>
                Transform your content, grow your audience
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Send email using SendGrid API with Basic Auth
    const authHeader = 'Basic ' + Buffer.from(`${sendGridSid}:${sendGridSecret}`).toString('base64');
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailContent)
    });

    if (!response.ok) {
      const errorText = await response.text();
      error(`SendGrid API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to send email: ${response.status}`);
    }

    log(`Email sent successfully to ${email}`);

    return res.json({
      success: true,
      message: 'Email sent successfully',
      timestamp: new Date().toISOString()
    }, 200, {
      'Access-Control-Allow-Origin': '*'
    });

  } catch (err) {
    error(`Error sending email: ${err.message}`);
    error(err.stack);

    return res.json({
      error: 'Failed to send email. Please try again later.'
    }, 500, {
      'Access-Control-Allow-Origin': '*'
    });
  }
};
