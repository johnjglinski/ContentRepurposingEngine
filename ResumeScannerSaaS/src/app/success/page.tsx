'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowLeft, Sparkles } from 'lucide-react'

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            {plan === 'resume-unlimited'
              ? 'Your unlimited plan is now active. Scan as many resumes as you want!'
              : 'Your full resume analysis report is ready.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-gray-900">
              {plan === 'resume-unlimited' ? 'Unlimited Monthly Plan' : 'Single Resume Scan'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Active and ready to use</p>
          </div>

          <a href="/" className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
            <Sparkles className="w-4 h-4" />
            Scan Your Resume Now
          </a>

          <div className="border-t pt-4">
            <a href="/" className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
