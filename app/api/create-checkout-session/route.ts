import { NextRequest, NextResponse } from 'next/server';

// Allowed origins for CORS — loaded from environment
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

// Valid price IDs — loaded from environment
const VALID_PRICE_IDS = [
  process.env.STRIPE_BASIC_PRICE_ID,
  process.env.STRIPE_PRO_PRICE_ID,
  process.env.STRIPE_AGENCY_PRICE_ID,
].filter(Boolean);

/**
 * Get CORS headers for a given request origin.
 * Returns headers only if the origin is in the allowed list.
 */
function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || '';

  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
  }

  return {};
}

export async function POST(request: NextRequest) {
  try {
    const { priceId, successUrl, cancelUrl, customerEmail } = await request.json();

    // Validate price ID
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    // Validate price ID is in the allowed list (prevent arbitrary price injection)
    if (!VALID_PRICE_IDS.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    // Validate Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment service is not configured' },
        { status: 500, headers: getCorsHeaders(request) }
      );
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/cancel`,
      automatic_tax: { enabled: true },
      ...(customerEmail && { customer_email: customerEmail }),
    });

    return NextResponse.json(
      { id: session.id, url: (session as any).url },
      { headers: getCorsHeaders(request) }
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    },
  });
}
