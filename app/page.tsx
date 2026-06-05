'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Copy, Download, Sparkles } from 'lucide-react'
import StripeCheckout from '@/components/StripeCheckout'

export default function Home() {
  const [blogContent, setBlogContent] = useState('')
  const [email, setEmail] = useState('')
  const [socialPosts, setSocialPosts] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showPricing, setShowPricing] = useState(false)

  const handleRepurpose = async () => {
    if (!blogContent.trim()) return
    
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/generate-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: blogContent, email }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate posts')
      }

      const result = await response.json()
      setSocialPosts(result.posts || [])
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!showPricing ? (
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <Sparkles className="inline-block w-8 h-8 text-blue-600 mr-2" />
              Content Repurposing Engine
            </h1>
            <p className="text-lg text-gray-600">
              Transform your blog posts into optimized social media content in seconds
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">AI-Powered</Badge>
              <Badge variant="secondary">Automated</Badge>
              <Badge variant="secondary">One-Click</Badge>
            </div>
            <Button 
              onClick={() => setShowPricing(true)}
              variant="outline"
              className="mt-4"
            >
              View Pricing Plans
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>📝 Enter Your Blog Content</CardTitle>
                <CardDescription>
                  Paste your blog post or article content below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your blog content here..."
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="min-h-[200px]"
                />
                <Input
                  type="email"
                  placeholder="Enter your email for notifications"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-4"
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
                <CardTitle>📱 Your Social Media Posts</CardTitle>
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

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <span>💡 Pro tip: Paste any blog content and get instant social media posts</span>
            </div>
          </div>
        </div>
      ) : (
        <StripeCheckout />
      )}
    </div>
  )
}