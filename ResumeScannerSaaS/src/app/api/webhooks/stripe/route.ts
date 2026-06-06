import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', sub.id, 'customer:', sub.customer);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', sub.id);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email;
  const planType = session.metadata?.planType;

  if (!email) {
    console.log('No customer email in checkout session');
    return;
  }

  console.log(`Payment confirmed for "${planType || 'Resume Scan'}" by ${email}`);

  // Send confirmation email (optional - same pattern as DigitalProductStore)
  try {
    await sendConfirmationEmail(email, planType || 'Resume Scan');
  } catch (e) {
    console.error('Email failed:', e);
  }
}

async function sendConfirmationEmail(email: string, planName: string) {
  const nodemailer = (await import('nodemailer')).default;
  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net', port: 587, secure: false,
    auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY || '' },
  });

  await transporter.sendMail({
    from: `"ResumeScore" <${process.env.EMAIL_FROM || 'noreply@yourdomain.com'}>`,
    to: email,
    subject: `Welcome to ResumeScore! Your ${planName} is active`,
    html: `<h2>Welcome!</h2><p>Your <strong>${planName}</strong> is now active. Start scanning resumes at ${process.env.NEXT_PUBLIC_APP_URL || 'https://resume.yourdomain.com'}</p>`,
  });
}
