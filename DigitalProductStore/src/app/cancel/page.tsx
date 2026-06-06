'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            No worries! Your purchase was not completed. Feel free to browse more products or try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Having trouble? Check your payment details or try a different card.
            </p>
          </div>

          <Button size="lg" className="w-full gap-2" asChild>
            <a href="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </a>
          </Button>

          <p className="text-xs text-gray-500">
            Need help? Contact us at support@yourdomain.com
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
