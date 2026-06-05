import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Appwrite configuration (optional - for forwarding to Appwrite function)
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const USE_APPWRITE_WEBHOOK = process.env.USE_APPWRITE_WEBHOOK === 'true';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Option 1: Process webhook locally (default)
    if (!USE_APPWRITE_WEBHOOK) {
      await processWebhookLocally(event);
    } 
    // Option 2: Forward to Appwrite function
    else if (APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID) {
      await forwardToAppwrite(event, body, signature);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}

// Process webhook events locally
async function processWebhookLocally(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCreated(subscription);
      break;
    case 'customer.subscription.updated':
      const updatedSub = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(updatedSub);
      break;
    case 'customer.subscription.deleted':
      const deletedSub = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(deletedSub);
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentSucceeded(invoice);
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentFailed(failedInvoice);
      break;
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}

// Forward webhook to Appwrite function
async function forwardToAppwrite(event: Stripe.Event, body: string, signature: string) {
  try {
    const response = await fetch(
      `${APPWRITE_ENDPOINT}/v1/functions/webhooks-stripe/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': APPWRITE_PROJECT_ID!,
          'X-Stripe-Signature': signature,
        },
        body: JSON.stringify({
          event: event.type,
          data: event.data.object,
          rawBody: body,
        }),
      }
    );

    if (!response.ok) {
      console.error('Appwrite webhook forwarding failed:', await response.text());
    }
  } catch (error) {
    console.error('Error forwarding to Appwrite:', error);
  }
}

// Event handlers
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  // TODO: Grant access to premium features
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  // TODO: Update user access
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  // TODO: Revoke premium access
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);
  // TODO: Update payment history
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);
  // TODO: Handle failed payment
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  // TODO: Grant initial access
}
