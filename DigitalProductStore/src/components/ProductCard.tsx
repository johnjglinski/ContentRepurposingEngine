'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Check, Sparkles, Download, Star } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface ProductCardProps {
  id: string
  name: string
  price: number
  displayPrice: string
  description: string
  features: string[]
  category: string
  badge?: string | null
}

export default function ProductCard({ id, name, price, displayPrice, description, features, category, badge }: ProductCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
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
          // @ts-ignore
          await stripe.redirectToCheckout({ sessionId: session.id })
        }
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error)
      setError(error.message || 'Failed to start checkout. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2" />
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary">{category}</Badge>
          {badge && (
            <Badge variant={badge === 'Bestseller' ? 'default' : 'success'}>
              {badge === 'Bestseller' ? <><Star className="w-3 h-3 mr-1" /> Bestseller</> : badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-2 mb-6 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="text-3xl font-bold text-gray-900">{displayPrice}</div>
          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            size="lg"
            className="gap-2"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Buy Now
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
          <Download className="w-3 h-3" />
          Instant digital download after purchase
        </div>
      </CardContent>
    </Card>
  )
}
