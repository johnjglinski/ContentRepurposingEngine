import { NextRequest, NextResponse } from 'next/server';

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_FUNCTION_GENERATE_POSTS = 'generate-posts';

export async function POST(request: NextRequest) {
  try {
    const { content, email } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Call Appwrite function
    const response = await fetch(
      `${APPWRITE_ENDPOINT}/v1/functions/${APPWRITE_FUNCTION_GENERATE_POSTS}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        },
        body: JSON.stringify({ content, email }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Appwrite function error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to generate posts' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
