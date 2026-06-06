'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Copy, Download, Sparkles, Store, FileText, ArrowRight, Shield, Zap, Globe } from 'lucide-react'
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
        <div>
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-4">
                <Sparkles className="inline-block w-10 h-10 mr-2" />
                J3C Family Studio
              </h1>
              <p className="text-xl mb-6 max-w-3xl mx-auto">
                AI-powered tools for content creators and professionals. Transform your workflow, grow your income, and scale your business.
              </p>
              <div className="flex justify-center gap-3 mt-6 flex-wrap">
                <Badge variant="outline" className="text-white border-white px-4 py-2 text-sm">
                  <Zap className="w-4 h-4 mr-1" /> AI-Powered
                </Badge>
                <Badge variant="outline" className="text-white border-white px-4 py-2 text-sm">
                  <Shield className="w-4 h-4 mr-1" /> Secure & Private
                </Badge>
                <Badge variant="outline" className="text-white border-white px-4 py-2 text-sm">
                  <Globe className="w-4 h-4 mr-1" /> Cloud-Based
                </Badge>
              </div>
            </div>
          </section>

          {/* Income Systems Section */}
          <section className="max-w-6xl mx-auto py-12 px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Our Revenue Systems</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {/* Digital Product Store */}
              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Store className="w-8 h-8 text-purple-600" />
                    <CardTitle>Digital Product Store</CardTitle>
                  </div>
                  <CardDescription>
                    AI prompt templates, productivity checklists, and digital resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Ready-to-use AI prompt templates for any industry</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Productivity checklists and workflow guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Instant digital delivery after purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Secure Stripe-powered checkout</span>
                    </li>
                  </ul>
                  <a href="https://store.j3cfamily.studio" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Visit Store <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Resume Scanner SaaS */}
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <CardTitle>Resume Scanner SaaS</CardTitle>
                  </div>
                  <CardDescription>
                    AI-powered ATS resume scoring and optimization tool
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>ATS compatibility scoring for your resume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>AI-powered improvement suggestions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Freemium model - scan once free, unlimited with Pro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Detailed keyword and formatting analysis</span>
                    </li>
                  </ul>
                  <a href="https://resume.j3cfamily.studio" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Scan Your Resume <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Content Repurposing Engine Section */}
          <section className="max-w-6xl mx-auto py-8 px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Content Repurposing Engine</h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your blog posts into optimized social media content in seconds. Try it free below.
            </p>

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
              <Button 
                onClick={() => setShowPricing(true)}
                variant="outline"
                size="lg"
              >
                View Pricing Plans
              </Button>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-8 px-4 mt-12">
            <div className="max-w-6xl mx-auto text-center">
              <p className="mb-4">&copy; 2025 J3C Family Studio. All rights reserved.</p>
              <div className="flex justify-center gap-6 flex-wrap">
                <a href="https://j3cfamily.studio" className="hover:text-purple-400 transition-colors">Home</a>
                <a href="https://store.j3cfamily.studio" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Store</a>
                <a href="https://resume.j3cfamily.studio" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Resume Scanner</a>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        <StripeCheckout />
      )}
    </div>
  )
}
