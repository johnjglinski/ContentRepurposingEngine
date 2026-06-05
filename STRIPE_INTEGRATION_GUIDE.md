# Stripe Payment Integration Guide

## Overview

This document covers the complete Stripe payment integration for Content Repurposing Engine, including product setup, webhook configuration, environment variables, and deployment.

---

## 1. Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Next.js API     │────▶│    Stripe       │
│  (StripeCheckout)│     │  Routes          │     │    Dashboard    │
│                 │◀────│                  │◀────│                 │
│  React/Next.js  │     │  - Checkout      │     │  - Products     │
└─────────────────┘     │  - Webhook       │     │  - Subscriptions│
                        └──────────────────┘     └─────────────────┘
```

### API Routes
- `POST /api/create-checkout-session` — Creates a Stripe Checkout Session for subscription
- `POST /api/webhooks/stripe` — Receives and processes Stripe webhook events

---

## 2. Environment Variables

All variables go in `.env.local` (never commit this file). See `.env.example` for the template.

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side only) | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` |
| `STRIPE_BASIC_PRICE_ID` | Price ID for Basic plan ($9.99/mo) | `price_1OaBcD...` |
| `STRIPE_PRO_PRICE_ID` | Price ID for Pro plan ($19.99/mo) | `price_1OeFgH...` |
| `STRIPE_AGENCY_PRICE_ID` | Price ID for Agency plan ($49.99/mo) | `price_1OiJkL...` |
| `NEXT_PUBLIC_APP_URL` | App URL for redirect URLs | `http://localhost:3000` |

### ⚠️ Important Naming Convention

Next.js requires client-side env vars to be prefixed with `NEXT_PUBLIC_`. The old `.env.local` had `STRIPE_PUBLISHABLE_KEY` which was **incorrect** — it has been fixed to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

---

## 3. Creating Stripe Products & Prices

### Option A: Automated Setup Script (Recommended)

```bash
cd ContentRepurposingEngine
npm install dotenv stripe    # if not already installed
node scripts/setup-stripe.js
```

This script will:
1. Create 3 products in your Stripe account
2. Create monthly prices with 14-day trial periods
3. Output the price IDs for `.env.local`
4. Save configuration to `STRIPE_CONFIG.json`

### Option B: Manual Setup via Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/products (or `/live/` for production)
2. Click "Add Product" for each plan:

| Plan | Name | Price | Interval | Trial |
|------|------|-------|----------|-------|
| Basic | Content Repurposing Engine - Basic | $9.99 | Month | 14 days |
| Pro | Content Repurposing Engine - Pro | $19.99 | Month | 14 days |
| Agency | Content Repurposing Engine - Agency | $49.99 | Month | 14 days |

3. Copy the **Price ID** (starts with `price_...`) for each plan
4. Paste into `.env.local`:
```env
STRIPE_BASIC_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_yyy
STRIPE_AGENCY_PRICE_ID=price_zzz
```

---

## 4. Webhook Configuration

### Development (Local)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Start webhook forwarding:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
4. Copy the displayed webhook secret (`whsec_...`) into `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### Production (Azure/Vercel)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add Endpoint"
3. Enter your webhook URL:
   - Azure Functions: `https://your-function-app.azurewebsites.net/api/webhooks/stripe`
   - Vercel: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select these events:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.paid`
   - ✅ `customer.updated`
5. Save and copy the webhook signing secret

---

## 5. Webhook URL for Azure Functions Deployment

```
https://<YOUR_FUNCTION_APP_NAME>.azurewebsites.net/api/webhooks/stripe
```

### Azure Functions Webhook Handler

The Azure Functions API (`AZURE_FUNCTIONS_API/`) needs a Stripe webhook function added. See `AZURE_FUNCTIONS_API/index.js` for the existing pattern. Add:

```javascript
const { app } = require("@azure/functions");
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.http('stripe-webhook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'webhooks/stripe',
  handler: async (request) => {
    const sig = request.headers.get('stripe-signature');
    const rawBody = await request.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return { status: 400, body: JSON.stringify({ error: 'Signature verification failed' }) };
    }

    // Handle events (same logic as Next.js route)
    switch (event.type) {
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object.id);
        break;
      // ... handle other events
    }

    return { status: 200, body: JSON.stringify({ received: true }) };
  }
});
```

---

## 6. Testing Payment Flow

### Test Card Numbers

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Requires 3D Secure |
| `4000 0000 0000 0002` | Insufficient funds |
| `4000 0000 0000 0010` | Lost card |

### Test Steps

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Click "Start Trial" on any plan
4. Enter test card details (any future expiry, any CVC)
5. Verify redirect to `/success` page
6. Check Stripe Dashboard for the subscription

### Testing Webhooks Locally

```bash
# Send a test event via Stripe CLI
stripe trigger payment_intent.succeeded

# Or manually test with curl
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 7. Switching from Test to Live Mode

### Checklist

- [ ] Replace `sk_test_...` with `sk_live_...` in `STRIPE_SECRET_KEY`
- [ ] Replace `pk_test_...` with `pk_live_...` in `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Recreate products in live mode (test products don't carry over)
- [ ] Update all 3 price IDs in `.env.local` / production secrets
- [ ] Create new webhook endpoint in live Stripe Dashboard
- [ ] Copy new live webhook secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Test with real card (Stripe will charge $0.50 for verification)
- [ ] Verify success/cancel pages work correctly

### ⚠️ Warnings

- **Test and live products are separate** — you must recreate all products in live mode
- **Webhook secrets differ** between test and live environments
- **Never use live keys in development** — always use `sk_test_` / `pk_test_` locally

---

## 8. Error Handling & Rollback

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `No such price` | Price ID doesn't exist | Verify price IDs in Stripe Dashboard |
| `Signature verification failed` | Webhook secret mismatch | Regenerate webhook secret, update env var |
| `Invalid publishable key` | Wrong key format | Ensure key starts with `pk_test_` or `pk_live_` |
| `Rate limit exceeded` | Too many API calls | Add retry logic with exponential backoff |

### Rollback Procedure

1. Pause webhook endpoint in Stripe Dashboard (prevents duplicate processing)
2. Revert `.env.local` to previous known-good values
3. Restart the application
4. Verify existing subscriptions are unaffected
5. Resume webhook endpoint after confirming stability

---

## 9. Monitoring & Alerts

### Recommended Setup

- **Stripe Dashboard**: Enable email alerts for failed payments, chargebacks
- **Application Logs**: Monitor `/api/webhooks/stripe` response codes (non-200 = issue)
- **Usage Tracking**: `POST /api/track-usage` monitors API consumption per user
- **Database**: Track subscription status changes in your user database

### Key Metrics to Watch

- Subscription conversion rate
- Payment failure rate (>5% indicates issues)
- Churn rate (subscription cancellations)
- Average revenue per user (ARPU)

---

## 10. Files Modified/Created

| File | Purpose |
|------|---------|
| `app/api/create-checkout-session/route.ts` | Creates Stripe Checkout Sessions |
| `app/api/webhooks/stripe/route.ts` | Handles Stripe webhook events |
| `src/components/StripeCheckout.tsx` | Updated with env-based price IDs |
| `.env.local` | Fixed env var naming, added price ID vars |
| `.env.example` | Updated template with all required vars |
| `scripts/setup-stripe.js` | Automated product creation script |
| `STRIPE_INTEGRATION_GUIDE.md` | This document |

---

## 11. Security Notes

- **Never commit** `.env.local` or any secret keys to version control
- Webhook signature verification is mandatory — never skip it in production
- Use HTTPS for all webhook endpoints in production
- Restrict price IDs server-side (see `ALLOWED_PRICE_IDS` in checkout route)
- Log sensitive events but **never log full card numbers or CVVs**
