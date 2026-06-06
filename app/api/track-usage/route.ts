import { NextRequest, NextResponse } from 'next/server'

// Allowed origins for CORS
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
  }
  return {};
}

// Simple in-memory usage tracking (in production, use a database)
const usageTracker = new Map<string, { count: number; lastUsed: Date }>()

// Free tier limit
const FREE_TIER_LIMIT = 100;

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    // Sanitize inputs
    const sanitizedUserId = String(userId).substring(0, 128);
    const sanitizedAction = String(action).substring(0, 64);

    // Track usage
    const key = `${sanitizedUserId}:${sanitizedAction}`
    const current = usageTracker.get(key) || { count: 0, lastUsed: new Date() }

    current.count += 1
    current.lastUsed = new Date()
    usageTracker.set(key, current)

    const isOverLimit = current.count > FREE_TIER_LIMIT

    return NextResponse.json(
      {
        success: true,
        usage: {
          count: current.count,
          lastUsed: current.lastUsed,
          isOverLimit,
          limit: FREE_TIER_LIMIT,
        }
      },
      { headers: getCorsHeaders(request) }
    )
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400, headers: getCorsHeaders(request) }
      )
    }

    const sanitizedUserId = String(userId).substring(0, 128);

    // Get user's usage statistics
    const userUsage: Array<{ action: string; count: number; lastUsed: Date }> = []
    for (const [key, data] of Array.from(usageTracker.entries())) {
      if (key.startsWith(`${sanitizedUserId}:`)) {
        const action = key.split(':')[1]
        userUsage.push({
          action,
          count: data.count,
          lastUsed: data.lastUsed
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        usage: userUsage,
        limit: FREE_TIER_LIMIT,
      },
      { headers: getCorsHeaders(request) }
    )
  } catch (error) {
    console.error('Error getting usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(request),
      'Access-Control-Max-Age': '86400',
    },
  });
}
