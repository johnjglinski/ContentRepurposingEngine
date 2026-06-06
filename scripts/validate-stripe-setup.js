#!/usr/bin/env node
/**
 * Emergency Income Systems — Stripe Validation Script
 * ====================================================
 * Validates that all Stripe products, prices, webhooks, and env files are correctly configured.
 *
 * Usage:
 *   node scripts/validate-stripe-setup.js [--verbose]
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// ── Load env ──────────────────────────────────────────────────────────────────
// Load root .env.local first (for Stripe secret key)
const rootEnvPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

// Load subsystem .env.local files (for Price IDs) — these override root
const storeEnvPath = path.resolve(__dirname, '..', 'DigitalProductStore', '.env.local');
const saasEnvPath = path.resolve(__dirname, '..', 'ResumeScannerSaaS', '.env.local');
if (fs.existsSync(storeEnvPath)) {
  dotenv.config({ path: storeEnvPath, override: true });
}
if (fs.existsSync(saasEnvPath)) {
  dotenv.config({ path: saasEnvPath, override: true });
}

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const VERBOSE = process.argv.includes('--verbose');

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

const Stripe = require('stripe');
const stripe = new Stripe(STRIPE_SECRET_KEY);

let errors = 0;
let warnings = 0;
let passed = 0;

function pass(msg) {
  passed++;
  console.log(`  ✅ ${msg}`);
}

function warn(msg) {
  warnings++;
  console.log(`  ⚠️  ${msg}`);
}

function fail(msg) {
  errors++;
  console.log(`  ❌ ${msg}`);
}

function info(msg) {
  if (VERBOSE) console.log(`  ℹ️  ${msg}`);
}

// ── Expected products ─────────────────────────────────────────────────────────
const EXPECTED_PRODUCTS = {
  DigitalProductStore: [
    { envVar: 'NEXT_PUBLIC_STORE_SOCIAL_PROMPTS_PRICE_ID', name: '30 AI Prompts for Social Media Managers', amount: 700, type: 'one_time' },
    { envVar: 'NEXT_PUBLIC_STORE_CALENDAR_TEMPLATE_PRICE_ID', name: 'Content Calendar Template (Notion + Excel)', amount: 900, type: 'one_time' },
    { envVar: 'NEXT_PUBLIC_STORE_RATE_CALCULATOR_PRICE_ID', name: 'Freelancer Rate Calculator + Contract Template', amount: 1200, type: 'one_time' },
    { envVar: 'NEXT_PUBLIC_STORE_SIDE_HUSTLE_PROMPTS_PRICE_ID', name: 'Side Hustle Idea Generator (50 Prompts)', amount: 700, type: 'one_time' },
    { envVar: 'NEXT_PUBLIC_STORE_RESUME_BUILDER_PRICE_ID', name: 'Resume Builder Prompt Pack', amount: 900, type: 'one_time' },
  ],
  ResumeScannerSaaS: [
    { envVar: 'NEXT_PUBLIC_RESUME_SCAN_PRICE_ID', name: 'Single Resume Scan', amount: 300, type: 'one_time' },
    { envVar: 'NEXT_PUBLIC_RESUME_UNLIMITED_PRICE_ID', name: 'Unlimited Monthly Plan', amount: 900, type: 'recurring' },
  ],
};

// ── Validation functions ──────────────────────────────────────────────────────

async function validatePriceId(envVar, expected, systemName) {
  const priceId = process.env[envVar];

  if (!priceId) {
    fail(`[${systemName}] ${envVar} is not set in .env.local`);
    return;
  }

  if (priceId.startsWith('price_YOUR_') || (priceId.startsWith('price_') && priceId.length < 20)) {
    fail(`[${systemName}] ${envVar} is a placeholder: ${priceId}`);
    return;
  }

  try {
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });

    if (!price.active) {
      warn(`[${systemName}] Price ${priceId} is INACTIVE`);
    } else {
      pass(`[${systemName}] Price ${priceId} is active`);
    }

    // Verify amount
    if (price.unit_amount !== expected.amount) {
      fail(`[${systemName}] Amount mismatch: expected ${expected.amount}, got ${price.unit_amount}`);
    } else {
      info(`[${systemName}] Amount correct: $${(price.unit_amount / 100).toFixed(2)}`);
    }

    // Verify type
    if (expected.type === 'recurring' && !price.recurring) {
      fail(`[${systemName}] Expected recurring price, got one-time`);
    } else if (expected.type === 'one_time' && price.recurring) {
      fail(`[${systemName}] Expected one-time price, got recurring`);
    } else {
      info(`[${systemName}] Type correct: ${expected.type}`);
    }

    // Verify product name
    const product = price.product;
    if (typeof product === 'string') {
      info(`[${systemName}] Product ID: ${product}`);
    } else if (product && product.name) {
      info(`[${systemName}] Product name: ${product.name}`);
      if (!product.name.includes(expected.name.split(' ')[0])) {
        warn(`[${systemName}] Product name "${product.name}" may not match expected "${expected.name}"`);
      }
    }
  } catch (error) {
    fail(`[${systemName}] ${envVar} — cannot retrieve price ${priceId}: ${error.message}`);
  }
}

async function validateWebhooks() {
  console.log('\n🔗 Validating Webhook Endpoints...\n');

  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    const storeEndpoint = endpoints.data.find(e => e.url.includes('localhost:3001'));
    const saasEndpoint = endpoints.data.find(e => e.url.includes('localhost:3002'));

    if (storeEndpoint) {
      pass(`DigitalProductStore webhook: ${storeEndpoint.id} → ${storeEndpoint.url}`);
      if (!storeEndpoint.enabled) warn('Store webhook is DISABLED');
      const events = storeEndpoint.enabled_events;
      if (!events.includes('checkout.session.completed')) {
        fail('Store webhook missing checkout.session.completed event');
      }
    } else {
      warn('No webhook found for DigitalProductStore (localhost:3001)');
      warn('This is OK for initial setup — create it when testing locally');
    }

    if (saasEndpoint) {
      pass(`ResumeScannerSaaS webhook: ${saasEndpoint.id} → ${saasEndpoint.url}`);
      if (!saasEndpoint.enabled) warn('SaaS webhook is DISABLED');
      const events = saasEndpoint.enabled_events;
      const required = ['checkout.session.completed', 'customer.subscription.created', 'customer.subscription.deleted'];
      for (const evt of required) {
        if (!events.includes(evt)) fail(`SaaS webhook missing ${evt} event`);
      }
    } else {
      warn('No webhook found for ResumeScannerSaaS (localhost:3002)');
      warn('This is OK for initial setup — create it when testing locally');
    }
  } catch (error) {
    fail(`Cannot list webhooks: ${error.message}`);
  }
}

async function validateEnvFiles() {
  console.log('\n📄 Validating .env.local Files...\n');

  for (const [label, filePath, products] of [
    ['DigitalProductStore', storeEnvPath, EXPECTED_PRODUCTS.DigitalProductStore],
    ['ResumeScannerSaaS', saasEnvPath, EXPECTED_PRODUCTS.ResumeScannerSaaS],
  ]) {
    if (!fs.existsSync(filePath)) {
      fail(`${label}: .env.local not found at ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const envConfig = dotenv.parse(content);

    for (const product of products) {
      const value = envConfig[product.envVar];
      if (!value) {
        fail(`${label}: ${product.envVar} not found in .env.local`);
      } else if (value.startsWith('price_YOUR_')) {
        fail(`${label}: ${product.envVar} is still a placeholder`);
      } else if (value.startsWith('price_') && value.length > 20) {
        pass(`${label}: ${product.envVar} = ${value}`);
      } else {
        warn(`${label}: ${product.envVar} looks unusual: ${value}`);
      }
    }

    // Check webhook secret
    if (!envConfig.STRIPE_WEBHOOK_SECRET) {
      warn(`${label}: STRIPE_WEBHOOK_SECRET not set`);
    } else if (envConfig.STRIPE_WEBHOOK_SECRET.startsWith('whsec_YOUR_')) {
      warn(`${label}: STRIPE_WEBHOOK_SECRET is still a placeholder`);
    } else {
      pass(`${label}: STRIPE_WEBHOOK_SECRET is set`);
    }

    // Check Stripe keys
    if (!envConfig.STRIPE_SECRET_KEY || envConfig.STRIPE_SECRET_KEY.startsWith('sk_test_YOUR_')) {
      fail(`${label}: STRIPE_SECRET_KEY is not configured`);
    } else {
      pass(`${label}: STRIPE_SECRET_KEY is set`);
    }

    if (!envConfig.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || envConfig.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_YOUR_')) {
      fail(`${label}: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured`);
    } else {
      pass(`${label}: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Emergency Income Systems — Stripe Validation            ║');
  console.log(`║  Environment: ${STRIPE_SECRET_KEY.startsWith('sk_live_') ? '🔴 LIVE' : '🟢 TEST'}                                      ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  // 1. Validate Stripe connection
  console.log('\n🔌 Testing Stripe Connection...\n');
  try {
    const account = await stripe.accounts.retrieve();
    pass(`Connected: ${account.business_profile?.name || account.id}`);
  } catch (error) {
    fail(`Cannot connect to Stripe: ${error.message}`);
    process.exit(1);
  }

  // 2. Validate all prices
  console.log('\n💰 Validating Products & Prices...\n');
  for (const [systemName, products] of Object.entries(EXPECTED_PRODUCTS)) {
    console.log(`  ── ${systemName} ──`);
    for (const product of products) {
      await validatePriceId(product.envVar, product, systemName);
    }
  }

  // 3. Validate webhooks
  await validateWebhooks();

  // 4. Validate env files
  await validateEnvFiles();

  // 5. Summary
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║  Results: ${passed} passed | ${warnings} warnings | ${errors} errors                    ║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (errors > 0) {
    console.log('  ❌ Validation FAILED. Fix the errors above before proceeding.\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('  ⚠️  Validation passed with warnings. Review them above.\n');
  } else {
    console.log('  ✅ All checks passed! Systems are ready.\n');
  }
}

main().catch(err => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});
