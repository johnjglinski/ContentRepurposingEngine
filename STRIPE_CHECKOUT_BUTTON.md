# Stripe Integration Guide

## Checkout Button Implementation

### Basic Stripe Checkout Button

```jsx
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe('pk_test_your_publishable_key')

const CheckoutButton = ({ priceId }) => {
  const handleCheckout = async () => {
    const stripe = await stripePromise
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    })
    
    const session = await response.json()
    
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    })
    
    if (result.error) {
      console.error(result.error.message)
    }
  }
  
  return (
    <button 
      onClick={handleCheckout}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Subscribe - $9.99/month
    </button>
  )
}
```

### Server-side API Endpoint (Next.js API Route)

```javascript
// pages/api/create-checkout-session.js
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { priceId } = req.body
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cancel`,
        automatic_tax: { enabled: true },
      })
      
      res.json({ id: session.id })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
```

### Price IDs Configuration

```javascript
// Price configuration
const PRICES = {
  BASIC: 'price_1YourBasicPriceId',
  PRO: 'price_1YourProPriceId',
  AGENCY: 'price_1YourAgencyPriceId'
}
```

### Webhook for Payment Confirmation

```javascript
// pages/api/webhooks/stripe.js
import Stripe from 'stripe'
import { sendWelcomeEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature']
  
  let event
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.log(`❌ Webhook signature verification failed.`, err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
  
  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      const subscription = event.data.object
      await sendWelcomeEmail(subscription.customer)
      break
    case 'invoice.payment_succeeded':
      const invoice = event.data.object
      // Grant access to premium features
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }
  
  res.json({ received: true })
}
```

### Usage Tracking for Billing

```javascript
// Track usage for billing
const trackUsage = async (userId, action) => {
  try {
    await fetch('/api/track-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, action }),
    })
  } catch (error) {
    console.error('Error tracking usage:', error)
  }
}

// Call this when generating posts
const handleGeneratePosts = async () => {
  await trackUsage(userId, 'generate_posts')
  // ... rest of the logic
}
```

## Implementation Steps

1. **Set up Stripe Account**
   - Create Stripe account
   - Get API keys from dashboard
   - Create products and price IDs

2. **Configure Environment Variables**
   - Add Stripe keys to `.env.local`
   - Set up webhook secret

3. **Implement Checkout Button**
   - Add checkout button to the UI
   - Create API route for checkout session

4. **Set up Webhooks**
   - Configure webhook endpoint
   - Handle payment confirmation events

5. **Test Integration**
   - Use Stripe test mode
   - Test checkout flow
   - Verify webhook events

6. **Go Live**
   - Switch to live mode
   - Update API keys
   - Configure production webhooks