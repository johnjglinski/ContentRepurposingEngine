#!/usr/bin/env node
/**
 * Stripe Product & Price Setup Script
 * Creates the 3 subscription tiers for Content Repurposing Engine.
 *
 * Usage:
 *   1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 *   2. Set STRIPE_SECRET_KEY in .env.local (test key starting with sk_test_)
 *   3. Run: node scripts/setup-stripe.js
 *
 * This script creates:
 *   - Basic Plan: $9.99/month
 *   - Pro Plan: $19.99/month
 *   - Agency Plan: $49.99/month
 *
 * After running, copy the output price IDs into .env.local
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripe() {
  console.log('=== Content Repurposing Engine - Stripe Setup ===\n');

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_your')) {
    console.error('ERROR: STRIPE_SECRET_KEY is not configured in .env.local');
    console.error('Get your test key from: https://dashboard.stripe.com/test/apikeys');
    process.exit(1);
  }

  const environment = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE';
  console.log(`Stripe environment: ${environment}`);
  console.log(`API key: ${process.env.STRIPE_SECRET_KEY.slice(0, 8)}...${process.env.STRIPE_SECRET_KEY.slice(-4)}\n`);

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for individual creators - unlimited posts with basic AI optimization',
      amountCents: 999,
      interval: 'month',
      metadata: { plan_tier: 'basic' }
    },
    {
      name: 'Pro',
      description: 'For serious content creators - advanced AI optimization and priority processing',
      amountCents: 1999,
      interval: 'month',
      metadata: { plan_tier: 'pro' }
    },
    {
      name: 'Agency',
      description: 'For teams and agencies - full API access, white-label option, dedicated support',
      amountCents: 4999,
      interval: 'month',
      metadata: { plan_tier: 'agency' }
    }
  ];

  const results = [];

  for (const plan of plans) {
    try {
      // Create product
      console.log(`\nCreating product: ${plan.name}...`);
      const product = await stripe.products.create({
        name: `Content Repurposing Engine - ${plan.name}`,
        description: plan.description,
        metadata: { integration: 'content-repurposing-engine', plan_tier: plan.metadata.plan_tier },
      });
      console.log(`  Product ID: ${product.id}`);

      // Create price for the product
      console.log(`Creating price: $${(plan.amountCents / 100).toFixed(2)}/${plan.interval}...`);
      const price = await stripe.prices.create({
        unit_amount: plan.amountCents,
        currency: 'usd',
        recurring: {
          interval: plan.interval,
          trial_period_days: 14, // 14-day free trial
        },
        product: product.id,
        metadata: { plan_tier: plan.metadata.plan_tier },
      });
      console.log(`  Price ID: ${price.id}`);

      results.push({
        name: plan.name,
        productId: product.id,
        priceId: price.id,
        amount: (plan.amountCents / 100).toFixed(2),
      });
    } catch (error) {
      console.error(`\nERROR creating ${plan.name}:`, error.message);
      if (error.code === 'resource_already_exists') {
        console.log('Resource already exists. Check your Stripe dashboard for existing products.');
      }
    }
  }

  // Output configuration summary
  console.log('\n\n=== CONFIGURATION SUMMARY ===\n');
  console.log('Add these to your .env.local file:\n');

  if (results.length > 0) {
    const envVars = [
      `STRIPE_BASIC_PRICE_ID=${results.find(r => r.name === 'Basic')?.priceId}`,
      `STRIPE_PRO_PRICE_ID=${results.find(r => r.name === 'Pro')?.priceId}`,
      `STRIPE_AGENCY_PRICE_ID=${results.find(r => r.name === 'Agency')?.priceId}`,
    ];

    console.log(envVars.join('\n'));
  }

  console.log('\n\n=== NEXT STEPS ===\n');
  console.log('1. Copy the price IDs above into .env.local');
  console.log('2. Set up webhook endpoint:');
  console.log('   stripe listen --forward-to localhost:3000/api/webhooks/stripe');
  console.log('3. Copy the webhook secret (whsec_...) into STRIPE_WEBHOOK_SECRET in .env.local');
  console.log('4. For production, create a webhook endpoint in Stripe Dashboard pointing to:');
  console.log('   https://your-domain.com/api/webhooks/stripe');
  console.log('5. Test with card number: 4242 4242 4242 4242\n');

  // Save results to a config file for easy reference
  const fs = require('fs');
  const configPath = './STRIPE_CONFIG.json';
  fs.writeFileSync(configPath, JSON.stringify({
    created_at: new Date().toISOString(),
    environment,
    products: results,
    webhook_url: 'https://your-domain.com/api/webhooks/stripe',
    events: [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'invoice.paid',
      'customer.updated'
    ]
  }, null, 2));
  console.log(`Configuration saved to ${configPath}`);
}

setupStripe().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
