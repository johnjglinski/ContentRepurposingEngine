import { NextRequest, NextResponse } from 'next/server';
import productsData from '@/data/products.json';

interface Product {
  id: string;
  name: string;
  price: number;
  displayPrice: string;
  stripePriceIdEnv: string;
  description: string;
}

const products: Product[] = productsData as unknown as Product[];

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Find the product
    const product = products.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get the Stripe Price ID from environment variable
    const priceId = process.env[product.stripePriceIdEnv];
    if (!priceId) {
      console.error(`Missing Stripe Price ID for product: ${productId}`);
      return NextResponse.json({ error: 'Product configuration error' }, { status: 500 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    // Create a one-time payment checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment (not subscription)
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&product=${productId}`,
      cancel_url: `${origin}/cancel`,
      automatic_tax: { enabled: true },
      metadata: {
        productId: product.id,
        productName: product.name,
        productFile: 'digital-download',
      },
    });

    return NextResponse.json({ id: session.id, url: (session as any).url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle CORS preflight
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
