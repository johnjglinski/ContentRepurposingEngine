import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory usage tracking (in production, use a database)
const usageTracker = new Map<string, { count: number; lastUsed: Date }>()

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 })
    }

    // Track usage
    const key = `${userId}:${action}`
    const current = usageTracker.get(key) || { count: 0, lastUsed: new Date() }
    
    current.count += 1
    current.lastUsed = new Date()
    usageTracker.set(key, current)

    // Check if user has exceeded free tier limits
    const usage = usageTracker.get(key)
    const isOverLimit = usage && usage.count > 100 // Free tier limit

    return NextResponse.json({
      success: true,
      usage: {
        count: usage?.count || 0,
        lastUsed: usage?.lastUsed || new Date(),
        isOverLimit
      }
    })
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's usage statistics
    const userUsage = []
    for (const [key, data] of usageTracker) {
      if (key.startsWith(`${userId}:`)) {
        const action = key.split(':')[1]
        userUsage.push({
          action,
          count: data.count,
          lastUsed: data.lastUsed
        })
      }
    }

    return NextResponse.json({
      success: true,
      usage: userUsage
    })
  } catch (error) {
    console.error('Error getting usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}