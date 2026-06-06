'use client'

import { useState } from 'react'
import ResumeUpload from '@/components/ResumeUpload'
import ScoreGauge from '@/components/ScoreGauge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Lock, Check, ArrowRight, Shield, Zap, Star } from 'lucide-react'

interface AnalysisResult {
  overallScore: number
  keywordMatches: string[]
  keywordGaps: string[]
  sectionScores: { summary: number; experience: number; skills: number; education: number }
  suggestions: string[]
}

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }
    setResumeFile(file)
    setFileName(file.name)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError('Please upload your resume and enter a job description.')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      if (resumeFile.type === 'application/pdf') {
        // For PDFs, send to server API for parsing
        const formData = new FormData()
        formData.append('resume', resumeFile)
        formData.append('jobDescription', jobDescription)

        const response = await fetch('/api/analyze-resume', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Analysis failed')
        const data = await response.json()
        setResult(data.result)
      } else {
        // For TXT files, read content then send to API
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsText(resumeFile)
        })

        const response = await fetch('/api/analyze-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: fileContent, jobDescription }),
        })

        if (!response.ok) throw new Error('Analysis failed')
        const data = await response.json()
        setResult(data.result)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'resume-scan' }),
      })

      const session = await response.json()
      if (session.url) {
        window.location.href = session.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-3 h-3 mr-1" /> AI-Powered ATS Scanner
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Is Your Resume Getting<br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Auto-Rejected?
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
          Upload your resume and any job description. Get an instant ATS compatibility score + actionable improvement tips. Free to try.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" /> 100% Private</Badge>
          <Badge variant="secondary"><Zap className="w-3 h-3 mr-1" /> Results in Seconds</Badge>
          <Badge variant="secondary"><Star className="w-3 h-3 mr-1" /> Free Score Included</Badge>
        </div>
      </section>

      {/* Upload Section */}
      {!result && (
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="grid gap-6 md:grid-cols-2">
            <ResumeUpload onFileSelect={handleFileSelect} fileName={fileName} isAnalyzing={isAnalyzing} />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📋 Target Job Description</CardTitle>
                <CardDescription>{"Paste the job posting you're applying for"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}

          <div className="text-center mt-6">
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!resumeFile || !jobDescription.trim() || isAnalyzing}
              className="gap-2 px-8"
            >
              {isAnalyzing ? (
                <>🤖 Analyzing...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Scan My Resume
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* How it works */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { step: '1', title: 'Upload Resume', desc: 'PDF or TXT, max 5MB' },
              { step: '2', title: 'Paste Job Description', desc: 'Any job posting URL text' },
              { step: '3', title: 'Get Your Score', desc: 'Instant ATS compatibility rating' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results Section */}
      {result && (
        <section className="max-w-4xl mx-auto px-4 pb-16">
          {/* Score Display */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2" />
            <CardHeader className="text-center">
              <CardTitle>Your ATS Compatibility Score</CardTitle>
              <CardDescription>Based on your resume vs. the target job description</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-6">
                <ScoreGauge score={result.overallScore} size="lg" />
              </div>

              {/* Free tier: keyword gaps */}
              <div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-sm text-gray-700">Top Keyword Gaps</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywordGaps.slice(0, 3).map((gap, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{gap}</Badge>
                  ))}
                </div>
              </div>

              {/* Paid content - blurred/locked */}
              <div className="w-full space-y-4">
                {/* Section Scores - locked */}
                <div className="bg-gray-100 rounded-lg p-6 text-center relative overflow-hidden">
                  <Lock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Section-by-Section Breakdown</p>
                  <p className="text-xs text-gray-400 mt-1">Upgrade to see detailed scores for each section</p>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                </div>

                {/* Suggestions - locked */}
                <div className="bg-gray-100 rounded-lg p-6 text-center relative overflow-hidden">
                  <Lock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Personalized Improvement Tips</p>
                  <p className="text-xs text-gray-400 mt-1">{result.suggestions.length} specific suggestions available</p>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                </div>

                {/* Optimized Resume - locked */}
                <div className="bg-gray-100 rounded-lg p-6 text-center relative overflow-hidden">
                  <Lock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">AI-Optimized Resume Version</p>
                  <p className="text-xs text-gray-400 mt-1">Get a rewritten resume tailored to this job</p>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                </div>

                {/* Upgrade CTA */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">Unlock Your Full Report</h3>
                  <p className="text-sm text-gray-600 mb-4">Get detailed section scores, personalized tips, and an AI-optimized resume version.</p>

                  <div className="grid gap-3 md:grid-cols-2 max-w-md mx-auto">
                    <Button onClick={handleUpgrade} variant="default" className="gap-2">
                      $3 One-Time Scan
                    </Button>
                    <Button onClick={() => {
                      fetch('/api/create-checkout-session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId: 'resume-unlimited' }),
                      }).then(r => r.json()).then(s => { if (s.url) window.location.href = s.url })
                    }} variant="outline" className="gap-2">
                      $9/mo Unlimited
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">Secure payment via Stripe • Cancel anytime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back button */}
          <div className="text-center">
            <Button variant="outline" onClick={() => { setResult(null); setResumeFile(null); setFileName(null); }}>
              Scan Another Resume
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ResumeScore. AI-powered resume analysis.</p>
          <p className="mt-1">Your data is processed securely and never stored permanently.</p>
        </div>
      </footer>
    </div>
  )
}
