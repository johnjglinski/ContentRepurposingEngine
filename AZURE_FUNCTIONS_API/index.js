const { AzureFunction, HttpRequest, HttpResponseInit, InvocationContext } = require('@azure/functions');
const { OpenAI } = require('openai');
const nodemailer = require('nodemailer');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

const httpTrigger = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { content, email } = await request.json();

    if (!content) {
      return {
        status: 400,
        body: JSON.stringify({ error: 'Content is required' })
      };
    }

    // Generate social media posts using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a social media marketing expert. Transform the given blog content into 4 engaging social media posts optimized for different platforms. Each post should be under 280 characters and include relevant hashtags. Return the posts as a JSON array."
        },
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const posts = JSON.parse(completion.choices[0].message.content);

    // Send email if provided
    if (email) {
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Your Social Media Posts',
        html: `
          <h2>Your Generated Social Media Posts</h2>
          ${posts.map((post, index) => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
              <h3>Post ${index + 1}</h3>
              <p>${post}</p>
            </div>
          `).join('')}
          <p>Thank you for using Content Repurposing Engine!</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    return {
      status: 200,
      body: JSON.stringify({
        success: true,
        posts: posts,
        emailSent: !!email
      })
    };

  } catch (error) {
    context.error(`Error processing request: ${error.message}`);
    return {
      status: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export default AzureFunction(httpTrigger);