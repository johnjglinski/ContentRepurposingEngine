'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Zap, AlertTriangle } from 'lucide-react'

interface UsageData {
  action: string
  count: number
  lastUsed: string
}

interface UsageTrackerProps {
  userId: string
}

export default function UsageTracker({ userId }: UsageTrackerProps) {
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOverLimit, setIsOverLimit] = useState(false)

  useEffect(() => {
    fetchUsageData()
  }, [userId])

  const fetchUsageData = async () => {
    try {
      const response = await fetch(`/api/track-usage?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setUsageData(data.usage)
        // Check if any action is over limit
        const hasOverLimit = data.usage.some((usage: UsageData) => usage.count > 100)
        setIsOverLimit(hasOverLimit)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const trackUsage = async (action: string) => {
    try {
      await fetch('/api/track-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      })
      
      // Refresh usage data
      await fetchUsageData()
    } catch (error) {
      console.error('Error tracking usage:', error)
    }
  }

  const totalUsage = usageData.reduce((sum, usage) => sum + usage.count, 0)
  const lastUsed = usageData.length > 0 ? 
    new Date(Math.max(...usageData.map(u => new Date(u.lastUsed).getTime()))) : 
    null

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Tracker</CardTitle>
          <CardDescription>Loading your usage data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Usage Tracker
        </CardTitle>
        <CardDescription>
          Monitor your usage and subscription status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Usage Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalUsage}</div>
              <div className="text-sm text-gray-600">Total Usage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{usageData.length}</div>
              <div className="text-sm text-gray-600">Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {lastUsed ? Math.floor((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-sm text-gray-600">Days Active</div>
            </div>
          </div>

          {/* Usage Alert */}
          {isOverLimit && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  You're approaching your usage limit!
                </p>
                <p className="text-xs text-yellow-600">
                  Consider upgrading to continue using all features.
                </p>
              </div>
            </div>
          )}

          {/* Usage Breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium">Usage Breakdown</h4>
            {usageData.length === 0 ? (
              <p className="text-sm text-gray-600">No usage data yet</p>
            ) : (
              <div className="space-y-2">
                {usageData.map((usage) => (
                  <div key={usage.action} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">{usage.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={usage.count > 100 ? "destructive" : "secondary"}>
                        {usage.count}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(usage.lastUsed).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={() => trackUsage('generate_posts')}
              variant="outline"
              size="sm"
            >
              Track Post Generation
            </Button>
            <Button 
              onClick={() => trackUsage('email_delivery')}
              variant="outline"
              size="sm"
            >
              Track Email Delivery
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}