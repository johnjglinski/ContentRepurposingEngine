'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Copy, Sparkles, BarChart3, Mail, Settings } from 'lucide-react'
import UsageTracker from '@/components/UsageTracker'

export default function DashboardPage() {
  const [blogContent, setBlogContent] = useState('')
  const [socialPosts, setSocialPosts] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('generator')

  const handleRepurpose = async () => {
    if (!blogContent.trim()) return
    
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/generate-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: blogContent }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate posts')
      }

      const result = await response.json()
      setSocialPosts(result.posts || [])
      
      // Track usage
      await fetch('/api/track-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'demo-user', action: 'generate_posts' }),
      })
    } catch (error) {
      console.error('Error processing content:', error)
      // Fallback to mock data for demo
      const mockPosts = [
        "🚀 Exciting news! Just discovered a game-changing approach to content marketing that's transforming how brands engage with audiences. #ContentMarketing #DigitalStrategy",
        "💡 Pro tip: The key to viral content isn't luck - it's understanding your audience's deepest pain points and addressing them authentically. #ContentCreation #MarketingTips",
        "📈 Just published a comprehensive guide on repurposing content across multiple platforms. Save this for your content strategy! #ContentStrategy #SocialMedia",
        "🎯 Want to maximize your content ROI? Focus on quality over quantity and repurpose your best pieces across all channels. #ContentMarketing #ROI"
      ]
      setSocialPosts(mockPosts)
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const tabs = [
    { id: 'generator', label: 'Content Generator', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your content repurposing workspace.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'generator' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>📝 Content Generator</CardTitle>
                <CardDescription>
                  Paste your blog content and generate social media posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your blog content here..."
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="min-h-[200px]"
                />
                <Button 
                  onClick={handleRepurpose} 
                  disabled={!blogContent.trim() || isProcessing}
                  className="w-full mt-4"
                >
                  {isProcessing ? '🤖 Processing...' : '✨ Generate Social Posts'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📱 Generated Posts</CardTitle>
                <CardDescription>
                  Click to copy any post to your clipboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                {socialPosts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Your generated posts will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {socialPosts.map((post, index) => (
                      <div key={index} className="relative">
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-800">{post}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(post, index)}
                        >
                          {copiedIndex === index ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid gap-6">
            <UsageTracker userId="demo-user" />
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>
                  Overview of your content repurposing activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm text-gray-600">Posts Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Emails Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">96%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">4.8</div>
                    <div className="text-sm text-gray-600">Avg. Engagement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Subscription Plan</h4>
                      <p className="text-sm text-gray-600">Pro Plan - $19.99/month</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive email updates</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">API Access</h4>
                      <p className="text-sm text-gray-600">Developer settings</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Test Email
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Sample
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}