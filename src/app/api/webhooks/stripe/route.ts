import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    switch (event.type) {
      case 'customer.subscription.created':
        const subscription = event.data.object
        await handleSubscriptionCreated(subscription)
        break
      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        await handleInvoicePaymentSucceeded(invoice)
        break
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object
        await handleInvoicePaymentFailed(failedInvoice)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}

async function handleSubscriptionCreated(subscription: any) {
  // Grant access to premium features
  console.log('Subscription created:', subscription.id)
  
  // Send welcome email
  // TODO: Implement email sending logic
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  // Update user access
  console.log('Payment succeeded:', invoice.id)
  
  // Grant access to premium features
  // TODO: Implement user access logic
}

async function handleInvoicePaymentFailed(invoice: any) {
  // Handle failed payment
  console.log('Payment failed:', invoice.id)
  
  // TODO: Implement failed payment handling
}