import { NextRequest, NextResponse } from 'next/server';

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_FUNCTION_CREATE_CHECKOUT = 'create-checkout-session';

// Flag to use Appwrite function or local Stripe integration
const USE_APPWRITE_CHECKOUT = process.env.USE_APPWRITE_CHECKOUT === 'true';

export async function POST(request: NextRequest) {
  try {
    const { priceId, successUrl, cancelUrl, customerEmail } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Option 1: Use Appwrite function
    if (USE_APPWRITE_CHECKOUT) {
      return await createCheckoutViaAppwrite(priceId, successUrl, cancelUrl, customerEmail, request);
    }
    
    // Option 2: Use local Stripe integration (default)
    return await createCheckoutLocally(priceId, request);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create checkout session via Appwrite function
async function createCheckoutViaAppwrite(
  priceId: string,
  successUrl?: string,
  cancelUrl?: string,
  customerEmail?: string,
  request?: NextRequest
) {
  const origin = request?.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

  const response = await fetch(
    `${APPWRITE_ENDPOINT}/v1/functions/${APPWRITE_FUNCTION_CREATE_CHECKOUT}/execute`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      },
      body: JSON.stringify({
        priceId,
        successUrl: successUrl || `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: cancelUrl || `${origin}/cancel`,
        customerEmail,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Appwrite function error:', errorData);
    return NextResponse.json(
      { error: errorData.error || 'Failed to create checkout session' },
      { status: response.status }
    );
  }

  const result = await response.json();
  return NextResponse.json({ id: result.sessionId, url: result.url });
}

// Create checkout session locally using Stripe
async function createCheckoutLocally(priceId: string, request: NextRequest) {
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel`,
    automatic_tax: { enabled: true },
  });

  return NextResponse.json({ id: session.id, url: (session as any).url });
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
