import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { content, email } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Call Azure Function for AI processing
    const response = await fetch(process.env.AZURE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, email }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate posts')
    }

    const result = await response.json()
    
    // Send email notification if email is provided
    if (email) {
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, posts: result.posts || [] }),
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the entire request if email fails
      }
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}