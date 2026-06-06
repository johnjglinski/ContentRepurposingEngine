import { NextRequest, NextResponse } from 'next/server';

// Product config for resume scanner
const PRODUCTS = {
  'resume-scan': {
    name: 'Single Resume Scan',
    priceIdEnv: 'NEXT_PUBLIC_RESUME_SCAN_PRICE_ID',
    mode: 'payment' as const, // one-time
  },
  'resume-unlimited': {
    name: 'Unlimited Monthly Plan',
    priceIdEnv: 'NEXT_PUBLIC_RESUME_UNLIMITED_PRICE_ID',
    mode: 'subscription' as const,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId || !PRODUCTS[productId as keyof typeof PRODUCTS]) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = PRODUCTS[productId as keyof typeof PRODUCTS];
    const priceId = process.env[product.priceIdEnv];

    if (!priceId) {
      console.error(`Missing Stripe Price ID for product: ${productId}`);
      return NextResponse.json({ error: 'Product configuration error' }, { status: 500 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: product.mode,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${productId}`,
      cancel_url: `${origin}/cancel`,
      automatic_tax: { enabled: true },
      metadata: { productId, planType: product.name },
    });

    return NextResponse.json({ id: session.id, url: (session as any).url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
