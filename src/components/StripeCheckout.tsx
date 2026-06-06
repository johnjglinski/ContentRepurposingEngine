'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// Price IDs are NOT secrets — they're safe to embed in client code.
// The server-side route (create-checkout-session) validates against env-configured price IDs.
// These are loaded from environment variables at build time.
const PRICES = {
  BASIC: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || 'price_basic_placeholder',
  PRO: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
  AGENCY: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID || 'price_agency_placeholder',
}

const pricingPlans = [
  {
    name: 'Basic',
    description: 'Perfect for individual creators',
    price: '$9.99',
    period: 'per month',
    features: ['Unlimited posts', 'Basic AI optimization', 'Email delivery'],
    priceId: PRICES.BASIC
  },
  {
    name: 'Pro',
    description: 'For serious content creators',
    price: '$19.99',
    period: 'per month',
    features: ['Everything in Basic', 'Advanced AI optimization', 'Priority processing', 'Custom templates'],
    priceId: PRICES.PRO
  },
  {
    name: 'Agency',
    description: 'For teams and agencies',
    price: '$49.99',
    period: 'per month',
    features: ['Everything in Pro', 'Team collaboration', 'API access', 'White-label option', 'Dedicated support'],
    priceId: PRICES.AGENCY
  }
]

export default function StripeCheckout() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async (priceId: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const session = await response.json()

      if (!response.ok) {
        throw new Error(session.error || 'Failed to create checkout session')
      }

      if (session.url) {
        window.location.href = session.url
      } else if (session.id) {
        const stripe = await stripePromise
        if (stripe) {
          // @ts-ignore - redirectToCheckout exists at runtime
          await stripe.redirectToCheckout({ sessionId: session.id })
        }
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      setError(error.message || 'Failed to start checkout. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600">Start with a 14-day free trial, no credit card required</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className="relative">
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="text-3xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-gray-500">/{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={isProcessing}
                className="w-full"
                variant={plan.name === 'Pro' ? 'default' : 'outline'}
              >
                {isProcessing ? 'Processing...' : `Start ${plan.name} Trial`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Need custom pricing? <a href="/contact" className="text-blue-600 hover:underline">Contact us</a>
        </p>
      </div>
    </div>
  )
}
