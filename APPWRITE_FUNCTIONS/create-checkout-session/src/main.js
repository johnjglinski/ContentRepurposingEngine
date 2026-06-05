// Appwrite function to create Stripe checkout sessions
export default async ({ req, res, log, error }) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.send('', 204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Appwrite-Project'
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.json({ error: 'Method not allowed' }, 405);
  }

  try {
    // Get Stripe secret key from environment
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      error('Stripe secret key not configured');
      return res.json({ error: 'Payment service not configured' }, 500);
    }

    // Parse request body
    const body = JSON.parse(req.body || '{}');
    const { priceId, successUrl, cancelUrl, customerEmail } = body;

    // Validate required fields
    if (!priceId) {
      return res.json({ error: 'Price ID is required' }, 400);
    }

    log(`Creating checkout session for price: ${priceId}`);

    // Build the checkout session parameters
    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl || `${getBaseUrl(req)}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${getBaseUrl(req)}/cancel`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true
    };

    // Add customer email if provided
    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    // Create checkout session via Stripe API
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(sessionParams).toString()
    });

    if (!response.ok) {
      const errorData = await response.json();
      error(`Stripe API error: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.error?.message || 'Failed to create checkout session');
    }

    const session = await response.json();

    log(`Checkout session created: ${session.id}`);

    return res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    }, 200, {
      'Access-Control-Allow-Origin': '*'
    });

  } catch (err) {
    error(`Error creating checkout session: ${err.message}`);
    error(err.stack);

    return res.json({
      error: 'Failed to create checkout session. Please try again.'
    }, 500, {
      'Access-Control-Allow-Origin': '*'
    });
  }
};

// Helper function to get base URL from request
function getBaseUrl(req) {
  // Check for Appwrite-specific headers
  const host = req.headers['x-appwrite-host'] || req.headers['host'] || 'localhost:3000';
  const protocol = req.headers['x-forwarded-proto'] || req.headers['x-appwrite-protocol'] || 'https';
  
  return `${protocol}://${host}`;
}
