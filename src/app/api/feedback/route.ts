import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { rating, category, comment, email } = await request.json()

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 })
    }

    // Store feedback entry
    const feedbackEntry = {
      id: crypto.randomUUID(),
      rating,
      category,
      comment,
      email: email || null,
      timestamp: new Date().toISOString(),
      source: 'in-app-widget',
    }

    // TODO: Store in Appwrite database collection "feedback"
    // For now, log to console (replace with DB write in production)
    console.log('New feedback:', JSON.stringify(feedbackEntry))

    return NextResponse.json({ success: true, id: feedbackEntry.id })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
