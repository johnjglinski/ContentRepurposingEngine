import { NextRequest, NextResponse } from 'next/server';

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_FUNCTION_SEND_EMAIL = 'send-email';

export async function POST(request: NextRequest) {
  try {
    const { email, posts } = await request.json();

    if (!email || !posts) {
      return NextResponse.json({ error: 'Email and posts are required' }, { status: 400 });
    }

    // Call Appwrite function
    const response = await fetch(
      `${APPWRITE_ENDPOINT}/v1/functions/${APPWRITE_FUNCTION_SEND_EMAIL}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        },
        body: JSON.stringify({ email, posts }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Appwrite function error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to send email' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
