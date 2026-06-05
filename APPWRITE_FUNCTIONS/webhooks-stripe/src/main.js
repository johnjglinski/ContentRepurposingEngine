// Appwrite function for handling Stripe webhooks
export default async ({ req, res, log, error }) => {
  // Only allow POST requests for webhooks
  if (req.method !== 'POST') {
    return res.json({ error: 'Method not allowed' }, 405);
  }

  try {
    // Get Stripe configuration from environment
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      error('Stripe configuration not set');
      return res.json({ error: 'Stripe not configured' }, 500);
    }

    // Get the raw body and signature
    const body = req.body;
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      error('No Stripe signature found');
      return res.json({ error: 'No signature' }, 400);
    }

    // Verify webhook signature
    const event = await verifyStripeSignature(body, signature, webhookSecret, log, error);

    if (!event) {
      return res.json({ error: 'Invalid signature' }, 400);
    }

    log(`Processing Stripe event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, log, error);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, log, error);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, log, error);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, log, error);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, log, error);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, log, error);
        break;

      default:
        log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    return res.json({ received: true }, 200);

  } catch (err) {
    error(`Webhook error: ${err.message}`);
    error(err.stack);
    return res.json({ error: 'Webhook handler failed' }, 400);
  }
};

// Verify Stripe webhook signature
async function verifyStripeSignature(body, signature, webhookSecret, log, error) {
  try {
    // Parse the signature header
    const elements = signature.split(',');
    const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1];
    const signatures = elements.filter(e => e.startsWith('v1=')).map(e => e.split('=')[1]);

    if (!timestamp || signatures.length === 0) {
      error('Invalid signature format');
      return null;
    }

    // Create the signed payload
    const signedPayload = `${timestamp}.${body}`;

    // Compute expected signature using HMAC-SHA256
    const crypto = await import('crypto');
    const expectedSignature = crypto.createHmac('sha256', webhookSecret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Verify signature
    const isValid = signatures.some(sig => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(sig, 'hex'),
          Buffer.from(expectedSignature, 'hex')
        );
      } catch {
        return false;
      }
    });

    if (!isValid) {
      error('Signature verification failed');
      return null;
    }

    // Check timestamp tolerance (5 minutes)
    const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (timestampAge > 300) {
      error('Webhook timestamp too old');
      return null;
    }

    // Parse and return the event
    return JSON.parse(body);
  } catch (err) {
    error(`Signature verification error: ${err.message}`);
    return null;
  }
}

// Handle subscription created event
async function handleSubscriptionCreated(subscription, log, error) {
  log(`Subscription created: ${subscription.id}`);
  log(`Customer: ${subscription.customer}`);
  log(`Status: ${subscription.status}`);

  // TODO: Implement your business logic here
  // - Grant access to premium features
  // - Update user record in database
  // - Send welcome email
  
  try {
    // Example: Update user subscription status in Appwrite Database
    // const client = new Client()
    //   .setEndpoint(process.env.APPWRITE_ENDPOINT)
    //   .setProject(process.env.APPWRITE_PROJECT_ID)
    //   .setKey(process.env.APPWRITE_API_KEY);
    // 
    // const databases = new Databases(client);
    // await databases.updateDocument(
    //   'database-id',
    //   'users-collection-id',
    //   userId,
    //   { subscriptionStatus: 'active', subscriptionId: subscription.id }
    // );
    
    log('Subscription created successfully processed');
  } catch (err) {
    error(`Error processing subscription created: ${err.message}`);
  }
}

// Handle subscription updated event
async function handleSubscriptionUpdated(subscription, log, error) {
  log(`Subscription updated: ${subscription.id}`);
  log(`Status: ${subscription.status}`);

  // TODO: Implement your business logic here
  // - Update user access level
  // - Handle plan changes
}

// Handle subscription deleted/canceled event
async function handleSubscriptionDeleted(subscription, log, error) {
  log(`Subscription deleted: ${subscription.id}`);
  log(`Customer: ${subscription.customer}`);

  // TODO: Implement your business logic here
  // - Revoke premium access
  // - Update user record
  // - Send cancellation email
}

// Handle successful payment
async function handleInvoicePaymentSucceeded(invoice, log, error) {
  log(`Payment succeeded for invoice: ${invoice.id}`);
  log(`Amount: ${invoice.amount_paid / 100} ${invoice.currency}`);
  log(`Customer: ${invoice.customer}`);

  // TODO: Implement your business logic here
  // - Extend subscription period
  // - Update payment history
  // - Send receipt email
}

// Handle failed payment
async function handleInvoicePaymentFailed(invoice, log, error) {
  log(`Payment failed for invoice: ${invoice.id}`);
  log(`Customer: ${invoice.customer}`);
  log(`Attempt count: ${invoice.attempt_count}`);

  // TODO: Implement your business logic here
  // - Send payment failed notification
  // - Update user status
  // - Implement retry logic or grace period
}

// Handle completed checkout session
async function handleCheckoutSessionCompleted(session, log, error) {
  log(`Checkout session completed: ${session.id}`);
  log(`Customer: ${session.customer}`);
  log(`Subscription: ${session.subscription}`);

  // TODO: Implement your business logic here
  // - Create user account if needed
  // - Grant initial access
  // - Send welcome email
}
