import { Client, Databases, ID, Query } from 'node-appwrite';
import OpenAI from 'openai';

// Appwrite function entry point
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
    const { content, email } = body;

    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.json(
        { error: 'Content is required and must be a non-empty string' },
        400
      );
    }

    // Validate email format if provided
    if (email && typeof email !== 'string') {
      return res.json(
        { error: 'Email must be a valid string' },
        400
      );
    }

    // Initialize LM Studio client (OpenAI-compatible API)
    const lmStudioUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1';
    const lmStudioModel = process.env.LM_STUDIO_MODEL || 'local-model';

    log(`Connecting to LM Studio at: ${lmStudioUrl}`);

    const openai = new OpenAI({
      baseURL: lmStudioUrl,
      apiKey: 'lm-studio' // LM Studio doesn't require a real API key
    });

    // Generate social media posts using LM Studio
    log('Generating social media posts with LM Studio...');
    
    const completion = await openai.chat.completions.create({
      model: lmStudioModel,
      messages: [
        {
          role: 'system',
          content: `You are a social media marketing expert. Transform the given blog content into 4 engaging social media posts optimized for different platforms (Twitter, LinkedIn, Facebook, Instagram). Each post should be under 280 characters and include relevant hashtags. Return ONLY a valid JSON array of strings with no other text.`
        },
        {
          role: 'user',
          content: content.trim()
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    // Parse the generated posts
    let posts;
    try {
      const rawContent = completion.choices[0].message.content;
      posts = JSON.parse(rawContent);

      // Ensure posts is an array
      if (!Array.isArray(posts)) {
        throw new Error('Response is not an array');
      }

      // Validate and truncate posts if needed
      posts = posts.map((post, index) => {
        if (typeof post !== 'string') {
          throw new Error(`Post ${index + 1} is not a string`);
        }
        if (post.length > 280) {
          log(`Post ${index + 1} exceeds 280 characters, truncating...`);
          return post.substring(0, 277) + '...';
        }
        return post;
      });
    } catch (parseError) {
      error(`Failed to parse AI response: ${parseError.message}`);
      return res.json(
        { error: 'Failed to generate posts. Please try again.' },
        500
      );
    }

    // Send email notification if email was provided
    let emailSent = false;
    if (email) {
      try {
        await sendEmailNotification(email, posts);
        emailSent = true;
        log(`Email sent successfully to ${email}`);
      } catch (emailError) {
        error(`Failed to send email: ${emailError.message}`);
        // Don't fail the request if email fails
      }
    }

    // Return successful response
    return res.json({
      success: true,
      posts: posts,
      emailSent: emailSent,
      timestamp: new Date().toISOString()
    }, 200, {
      'Access-Control-Allow-Origin': '*'
    });

  } catch (err) {
    error(`Error processing request: ${err.message}`);
    error(err.stack);

    // Handle specific error types
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      return res.json({
        error: 'AI service (LM Studio) is not available. Please ensure LM Studio is running.',
        retryAfter: 30
      }, 503, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    return res.json({
      error: 'Internal server error. Please try again later.'
    }, 500, {
      'Access-Control-Allow-Origin': '*'
    });
  }
};

// Helper function to send email via SendGrid
async function sendEmailNotification(email, posts) {
  const sendGridSid = process.env.SENDGRID_SID;
  const sendGridSecret = process.env.SENDGRID_SECRET;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@contentrepurposing.com';

  if (!sendGridSid || !sendGridSecret) {
    throw new Error('SendGrid credentials not configured');
  }

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
                <p style="margin: 0; color: #333; line-height: 1.5;">${post}</p>
              </div>
            `).join('')}
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
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }
}
