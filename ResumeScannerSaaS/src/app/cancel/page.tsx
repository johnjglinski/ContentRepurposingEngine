'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            No worries! Your free score is still available. Upgrade anytime to unlock the full report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Your free ATS score is still valid. Upgrade later to see detailed suggestions and your optimized resume.
            </p>
          </div>

          <a href="/" className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
