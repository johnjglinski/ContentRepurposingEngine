'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard } from 'lucide-react'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
          <p className="text-lg text-gray-600">
            No worries! You can return to your subscription at any time.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Why was the payment cancelled?</Card1>
              <CardDescription>
                This could happen for several reasons:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• You clicked the cancel button during checkout</li>
                <li>• Your payment method was declined</li>
                <li>• You decided to think about it first</li>
                <li>• There was a technical issue</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ready to try again?</CardTitle>
              <CardDescription>
                Content Repurposing Engine can help you transform your content in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Plans
                </Button>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Still have questions?</CardTitle>
              <CardDescription>
                We're here to help you make the right decision.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <h4 className="font-medium mb-1">Free Trial Available</h4>
                  <p className="text-gray-600">Start with a 14-day free trial to test all features.</p>
                </div>
                <div className="text-sm">
                  <h4 className="font-medium mb-1">No Credit Card Required</h4>
                  <p className="text-gray-600">Sign up without entering payment details.</p>
                </div>
                <div className="text-sm">
                  <h4 className="font-medium mb-1">Cancel Anytime</h4>
                  <p className="text-gray-600">No hidden fees or long-term commitments.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Questions? Email us at support@contentrepurposing.com
          </p>
        </div>
      </div>
    </div>
  )
}