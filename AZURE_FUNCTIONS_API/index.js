const { app, HttpRequest, HttpResponseInit, InvocationContext } = require("@azure/functions");
const { OpenAI } = require('openai');
const nodemailer = require('nodemailer');

// Initialize LM Studio client (OpenAI-compatible API)
// LM Studio runs locally and provides an OpenAI-compatible endpoint
const openai = new OpenAI({
  baseURL: process.env.LM_STUDIO_URL || 'http://localhost:1234/v1',
  apiKey: 'lm-studio' // LM Studio doesn't require a real API key, but the client needs one
});

// Initialize SendGrid transporter with provided credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SENDGRID_SID || 'apikey',
    pass: process.env.SENDGRID_SECRET || process.env.SENDGRID_API_KEY
  }
});

// Register the HTTP-triggered function for generating posts
app.http('generate-posts', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'generate-posts',
  
  handler: async (request, context) => {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
    }

    context.log(`Http function processed request for url "${request.url}"`);

    try {
      // Parse request body
      const body = await request.json();
      const { content, email } = body || {};

      // Validate required fields
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Content is required and must be a non-empty string' })
        };
      }

      // Validate email format if provided
      if (email && typeof email !== 'string') {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Email must be a valid string' })
        };
      }

      // Check required environment variables are configured
      if (!process.env.LM_STUDIO_URL) {
        context.warn('LM_STUDIO_URL not configured, using default localhost:1234');
      }

      // Generate social media posts using LM Studio
      context.log('Generating social media posts with LM Studio...');
      const completion = await openai.chat.completions.create({
        model: process.env.LM_STUDIO_MODEL || "local-model",
        messages: [
          {
            role: "system",
            content: "You are a social media marketing expert. Transform the given blog content into 4 engaging social media posts optimized for different platforms (Twitter, LinkedIn, Facebook, Instagram). Each post should be under 280 characters and include relevant hashtags. Return ONLY a valid JSON array of strings with no other text."
          },
          {
            role: "user",
            content: content.trim()
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      // Parse the generated posts from OpenAI response
      let posts;
      try {
        const rawContent = completion.choices[0].message.content;
        posts = JSON.parse(rawContent);
        
        // Ensure posts is an array of strings
        if (!Array.isArray(posts)) {
          throw new Error('OpenAI did not return an array');
        }
        
        // Validate each post is a string and under 280 chars
        posts.forEach((post, index) => {
          if (typeof post !== 'string') {
            throw new Error(`Post ${index + 1} is not a string`);
          }
          if (post.length > 280) {
            context.warn(`Post ${index + 1} exceeds 280 characters, truncating...`);
            posts[index] = post.substring(0, 277) + '...';
          }
        });
      } catch (parseError) {
        context.error(`Failed to parse OpenAI response: ${parseError.message}`);
        return {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Failed to generate posts. Please try again.' })
        };
      }

      // Send email notification if email was provided
      let emailSent = false;
      if (email) {
        try {
          const mailOptions = {
            from: process.env.FROM_EMAIL || 'noreply@contentrepurposing.com',
            to: email,
            subject: 'Your Social Media Posts - Content Repurposing Engine',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Your Generated Social Media Posts</h2>
                ${posts.map((post, index) => `
                  <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
                    <h3 style="color: #666;">Post ${index + 1}</h3>
                    <p>${post.replace(/\n/g, '<br>')}</p>
                  </div>
                `).join('')}
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Thank you for using Content Repurposing Engine!</p>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
          emailSent = true;
          context.log(`Email sent successfully to ${email}`);
        } catch (emailError) {
          context.error(`Failed to send email: ${emailError.message}`);
          // Don't fail the request if email fails - posts were generated successfully
        }
      }

      // Return successful response with generated posts
      return {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          posts: posts,
          emailSent: emailSent,
          timestamp: new Date().toISOString()
        })
      };

    } catch (error) {
      context.error(`Error processing request: ${error.message}`);
      context.error(error.stack);
      
      // Determine appropriate error response based on error type
      if (error.name === 'OpenAIError' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: 'AI service (LM Studio) is not available. Please ensure LM Studio is running and try again.',
            retryAfter: 30
          })
        };
      }

      return {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Internal server error. Please try again later.' })
      };
    }
  }
});
