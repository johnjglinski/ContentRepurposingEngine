# Stripe Automation — Emergency Income Systems

## Overview

This directory contains automated scripts to configure all Stripe products, prices, webhooks, and environment variables for both Emergency Income Systems — **eliminating all manual dashboard work**.

## Scripts

### 1. `setup-emergency-income-stripe.js` — Main Setup Script

Creates all 7 Stripe products/prices, configures webhook endpoints, and updates both `.env.local` files automatically.

**What it does:**
- Creates 5 one-time products for DigitalProductStore ($7, $9, $12, $7, $9)
- Creates 1 one-time + 1 subscription product for ResumeScannerSaaS ($3 + $9/mo)
- Creates webhook endpoints for both systems
- Updates both `.env.local` files with real Price IDs and webhook secrets
- Saves a JSON config file with all created resource IDs

**Usage:**

```bash
# Test mode (safe — uses sk_test_ key)
node scripts/setup-emergency-income-stripe.js

# Dry run (no API calls — just prints what would happen)
node scripts/setup-emergency-income-stripe.js --dry-run

# Live mode (⚠️ creates real products that customers can buy)
node scripts/setup-emergency-income-stripe.js --live
```

**Prerequisites:**
- `STRIPE_SECRET_KEY` set in `.env.local` (or environment)
- Stripe SDK installed (`npm install` in project root)

### 2. `validate-stripe-setup.js` — Validation Script

Verifies that all Stripe resources are correctly configured and both `.env.local` files have real (non-placeholder) values.

**What it checks:**
- All 7 Price IDs are valid and active
- Price amounts match expected values
- Product types are correct (one-time vs recurring)
- Webhook endpoints exist with correct events
- Both `.env.local` files have real Stripe keys and Price IDs

**Usage:**

```bash
node scripts/validate-stripe-setup.js
node scripts/validate-stripe-setup.js --verbose   # detailed output
```

## Product Catalog

### System 1: DigitalProductStore (Port 3001)

| # | Product | Price | Type | Env Var |
|---|---------|-------|------|---------|
| 1 | 30 AI Prompts for Social Media Managers | $7.00 | One-time | `NEXT_PUBLIC_STORE_SOCIAL_PROMPTS_PRICE_ID` |
| 2 | Content Calendar Template (Notion + Excel) | $9.00 | One-time | `NEXT_PUBLIC_STORE_CALENDAR_TEMPLATE_PRICE_ID` |
| 3 | Freelancer Rate Calculator + Contract Template | $12.00 | One-time | `NEXT_PUBLIC_STORE_RATE_CALCULATOR_PRICE_ID` |
| 4 | Side Hustle Idea Generator (50 Prompts) | $7.00 | One-time | `NEXT_PUBLIC_STORE_SIDE_HUSTLE_PROMPTS_PRICE_ID` |
| 5 | Resume Builder Prompt Pack | $9.00 | One-time | `NEXT_PUBLIC_STORE_RESUME_BUILDER_PRICE_ID` |

### System 2: ResumeScannerSaaS (Port 3002)

| # | Product | Price | Type | Env Var |
|---|---------|-------|------|---------|
| 6 | Single Resume Scan | $3.00 | One-time | `NEXT_PUBLIC_RESUME_SCAN_PRICE_ID` |
| 7 | Unlimited Monthly Plan | $9.00/mo | Subscription | `NEXT_PUBLIC_RESUME_UNLIMITED_PRICE_ID` |

## Webhook Endpoints

| System | URL | Events |
|--------|-----|--------|
| DigitalProductStore | `http://localhost:3001/api/webhooks/stripe` | `checkout.session.completed` |
| ResumeScannerSaaS | `http://localhost:3002/api/webhooks/stripe` | `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.deleted` |

## Quick Start

### First Time Setup (Test Mode)

```bash
# 1. Ensure you have a Stripe test secret key in .env.local
#    STRIPE_SECRET_KEY=sk_test_...

# 2. Run the setup script
node scripts/setup-emergency-income-stripe.js

# 3. Validate everything was created correctly
node scripts/validate-stripe-setup.js

# 4. Start both dev servers
cd DigitalProductStore && npm run dev    # Port 3001
cd ResumeScannerSaaS && npm run dev      # Port 3002

# 5. Test payments with Stripe test card: 4242 4242 4242 4242
```

### Switching to Production (Live Mode)

```bash
# 1. Update .env.local with live keys:
#    STRIPE_SECRET_KEY=sk_live_...
#    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# 2. Run setup in live mode
node scripts/setup-emergency-income-stripe.js --live

# 3. Validate
node scripts/validate-stripe-setup.js

# 4. Update webhook URLs in Stripe Dashboard to point to production domain
```

## Output Files

After running the setup script, these files are created/modified:

- **`DigitalProductStore/.env.local`** — Updated with 5 Price IDs + webhook secret
- **`ResumeScannerSaaS/.env.local`** — Updated with 2 Price IDs + webhook secret
- **`STRIPE_EMERGENCY_INCOME_CONFIG.json`** — Full JSON record of all created resources

## Troubleshooting

### "Resource already exists" error
Products with the same name already exist in your Stripe account. Either:
- Delete them from the Stripe Dashboard and re-run, or
- Manually copy the existing Price IDs into your `.env.local` files

### Webhook validation fails locally
Stripe cannot send webhooks to `localhost`. For local testing:
```bash
# Install Stripe CLI, then:
stripe listen --forward-to localhost:3001/api/webhooks/stripe
stripe listen --forward-to localhost:3002/api/webhooks/stripe
```

### "Price ID is a placeholder"
The `.env.local` file still has `price_YOUR_...` placeholders. Run the setup script with a valid `STRIPE_SECRET_KEY`.

## Architecture

```
scripts/
├── setup-emergency-income-stripe.js    ← Creates everything
├── validate-stripe-setup.js            ← Verifies everything
├── setup-stripe.js                     ← (Legacy: CRE subscriptions)
└── STRIPE_AUTOMATION_README.md         ← This file
```

## Security Notes

- **Never commit `.env.local` files** to version control
- **Never commit `STRIPE_CONFIG.json`** files — they contain resource IDs
- Test mode (`sk_test_`) is safe — no real charges
- Live mode (`sk_live_`) creates real products — customers can purchase immediately
- The `--dry-run` flag lets you preview all actions without making changes
