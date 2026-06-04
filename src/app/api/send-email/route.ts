import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, posts } = await request.json()

    if (!email || !posts) {
      return NextResponse.json({ error: 'Email and posts are required' }, { status: 400 })
    }

    // SendGrid email configuration
    const sendGridApiKey = process.env.SENDGRID_API_KEY
    const fromEmail = process.env.FROM_EMAIL || 'noreply@testmail.app'

    if (!sendGridApiKey) {
      console.error('SendGrid API key not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Create email content
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
              ${posts.map((post: string, index: number) => `
                <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #667eea;">
                  <p style="margin: 0; color: #333; line-height: 1.5;">${post}</p>
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
    }

    // Send email using SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}