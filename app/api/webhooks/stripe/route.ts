import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Validate required environment variables at module load
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not configured');
}
if (!STRIPE_WEBHOOK_SECRET) {
  console.error('STRIPE_WEBHOOK_SECRET is not configured');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Appwrite configuration (optional - for forwarding to Appwrite function)
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const USE_APPWRITE_WEBHOOK = process.env.USE_APPWRITE_WEBHOOK === 'true';

export async function POST(request: NextRequest) {
  try {
    // Validate configuration
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe is not configured — cannot process webhook');
      return NextResponse.json(
        { error: 'Webhook service not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Process webhook locally (default)
    if (!USE_APPWRITE_WEBHOOK) {
      await processWebhookLocally(event);
    }
    // Forward to Appwrite function if configured
    else if (APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID && APPWRITE_PROJECT_ID !== 'your-project-id-here') {
      await forwardToAppwrite(event, body, signature);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

// Process webhook events locally
async function processWebhookLocally(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCreated(subscription);
      break;
    }
    case 'customer.subscription.updated': {
      const updatedSub = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(updatedSub);
      break;
    }
    case 'customer.subscription.deleted': {
      const deletedSub = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(deletedSub);
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentSucceeded(invoice);
      break;
    }
    case 'invoice.payment_failed': {
      const failedInvoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentFailed(failedInvoice);
      break;
    }
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
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
        signal: AbortSignal.timeout(15000),
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
  console.log('Subscription created:', subscription.id, 'Status:', subscription.status);
  // TODO: Grant access to premium features in your database
  // Example: await db.users.update({ stripeCustomerId: subscription.customer }, { plan: 'premium' })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);
  // TODO: Update user access based on subscription status
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  // TODO: Revoke premium access in your database
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id, 'Amount:', invoice.amount_paid);
  // TODO: Update payment history, extend subscription period
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id, 'Attempt:', invoice.attempt_count);
  // TODO: Handle failed payment — notify user, retry logic
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id, 'Customer:', session.customer);
  // TODO: Grant initial access, send welcome email
}
