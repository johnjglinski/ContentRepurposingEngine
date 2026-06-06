import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import productsData from '@/data/products.json';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

interface Product {
  id: string;
  name: string;
  file: string;
}

const products: Product[] = productsData as unknown as Product[];

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const productId = session.metadata?.productId;
  const customerEmail = session.customer_details?.email;
  const productName = session.metadata?.productName;

  if (!productId || !customerEmail) {
    console.log('Missing product ID or customer email in checkout session');
    return;
  }

  // Find the product file path
  const product = products.find(p => p.id === productId);
  if (!product) {
    console.error(`Product not found for ID: ${productId}`);
    return;
  }

  const displayName = productName || product.name;

  console.log(`Payment received for "${displayName}" by ${customerEmail}. Product file: ${product.file}`);

  // Send confirmation email with download link
  try {
    await sendPurchaseConfirmationEmail(customerEmail, displayName, product.file);
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError);
    // Don't fail the webhook - the user still gets the success page
  }
}

async function sendPurchaseConfirmationEmail(email: string, productName: string, downloadPath: string) {
  // Use Nodemailer with SendGrid or any SMTP provider
  const nodemailer = (await import('nodemailer')).default;

  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY || '',
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  await transporter.sendMail({
    from: `"PromptShop" <${process.env.EMAIL_FROM || 'noreply@yourdomain.com'}>`,
    to: email,
    subject: `Your purchase: ${productName}`,
    html: `
      <h2>Thank you for your purchase!</h2>
      <p>You purchased: <strong>${productName}</strong></p>
      <p>Click the button below to download your product:</p>
      <a href="${appUrl}/success?product=${encodeURIComponent('download')}&file=${encodeURIComponent(downloadPath)}" 
         style="display:inline-block;padding:12px 24px;background:#ec4899;color:white;text-decoration:none;border-radius:6px;margin-top:12px;">
        Download Now
      </a>
      <p style="margin-top:20px;font-size:12px;color:#666;">If the button doesn't work, visit ${appUrl}/success</p>
    `,
  });
}
