#!/usr/bin/env node
/**
 * Emergency Income Systems — Stripe Automation Script
 * ====================================================
 * Creates all 7 Stripe products/prices and configures both .env.local files.
 *
 * SYSTEM 1: DigitalProductStore (5 one-time products)
 *   1. 30 AI Prompts for Social Media Managers — $7.00
 *   2. Content Calendar Template (Notion + Excel) — $9.00
 *   3. Freelancer Rate Calculator + Contract Template — $12.00
 *   4. Side Hustle Idea Generator (50 Prompts) — $7.00
 *   5. Resume Builder Prompt Pack — $9.00
 *
 * SYSTEM 2: ResumeScannerSaaS (1 one-time + 1 subscription)
 *   6. Single Resume Scan — $3.00 (one-time)
 *   7. Unlimited Monthly Plan — $9.00/month (subscription)
 *
 * Usage:
 *   1. Ensure STRIPE_SECRET_KEY is set in environment or .env.local
 *   2. node scripts/setup-emergency-income-stripe.js [--live] [--dry-run]
 *
 * Flags:
 *   --live     Use live mode (default is test mode)
 *   --dry-run  Print what would be created without making API calls
 */

const fs = require('fs');
const path = require('path');

// ── Load environment ──────────────────────────────────────────────────────────
// Try loading .env.local from project root
const dotenv = require('dotenv');
const envLocalPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isLiveMode = args.includes('--live');
const isDryRun = args.includes('--dry-run');

// ── Validation ────────────────────────────────────────────────────────────────
if (!STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY not found.');
  console.error('   Set it in .env.local or as an environment variable.');
  console.error('   Get keys from: https://dashboard.stripe.com/test/apikeys');
  process.exit(1);
}

const keyPrefix = isLiveMode ? 'sk_live_' : 'sk_test_';
if (!STRIPE_SECRET_KEY.startsWith(keyPrefix)) {
  const mode = isLiveMode ? 'LIVE' : 'TEST';
  console.error(`❌ ERROR: Expected ${mode} key starting with ${keyPrefix}`);
  console.error(`   Got: ${STRIPE_SECRET_KEY.slice(0, 8)}...`);
  process.exit(1);
}

// ── Stripe client ─────────────────────────────────────────────────────────────
const Stripe = require('stripe');
const stripe = new Stripe(STRIPE_SECRET_KEY);

// ── Product definitions ───────────────────────────────────────────────────────
const DIGITAL_PRODUCT_STORE_PRODUCTS = [
  {
    id: 'social-media-prompts',
    name: '30 AI Prompts for Social Media Managers',
    description: 'Ready-to-copy prompts that generate engaging social posts for Instagram, Twitter, LinkedIn, and TikTok. Save hours of content planning.',
    amountCents: 700,
    type: 'one_time',
    envVar: 'NEXT_PUBLIC_STORE_SOCIAL_PROMPTS_PRICE_ID',
  },
  {
    id: 'content-calendar-template',
    name: 'Content Calendar Template (Notion + Excel)',
    description: 'Plug-and-play content calendar that organizes your entire month of content in minutes. Works with Notion or Excel.',
    amountCents: 900,
    type: 'one_time',
    envVar: 'NEXT_PUBLIC_STORE_CALENDAR_TEMPLATE_PRICE_ID',
  },
  {
    id: 'freelancer-rate-calculator',
    name: 'Freelancer Rate Calculator + Contract Template',
    description: 'Know exactly what to charge. Includes a smart rate calculator spreadsheet and a professional contract template.',
    amountCents: 1200,
    type: 'one_time',
    envVar: 'NEXT_PUBLIC_STORE_RATE_CALCULATOR_PRICE_ID',
  },
  {
    id: 'side-hustle-prompts',
    name: 'Side Hustle Idea Generator (50 Prompts)',
    description: 'AI-powered prompts that generate personalized side hustle ideas based on your skills, schedule, and income goals.',
    amountCents: 700,
    type: 'one_time',
    envVar: 'NEXT_PUBLIC_STORE_SIDE_HUSTLE_PROMPTS_PRICE_ID',
  },
  {
    id: 'resume-builder-pack',
    name: 'Resume Builder Prompt Pack',
    description: 'AI prompts that help you craft ATS-optimized resumes. Includes section-by-section prompt templates for any industry.',
    amountCents: 900,
    type: 'one_time',
    envVar: 'NEXT_PUBLIC_STORE_RESUME_BUILDER_PRICE_ID',
  },
];

const RESUME_SCANNER_PRODUCTS = [
  {
    id: 'resume-scan',
    name: 'Single Resume Scan',
    description: 'One-time ATS compatibility score for your resume against a target job description.',
    amountCents: 300,
    type: 'one_time',
    envVar: 'NEXT_PUBLIC_RESUME_SCAN_PRICE_ID',
  },
  {
    id: 'resume-unlimited',
    name: 'Unlimited Monthly Plan',
    description: 'Unlimited resume scans per month. Get detailed section scores, personalized tips, and AI-optimized resume versions.',
    amountCents: 900,
    type: 'recurring',
    interval: 'month',
    envVar: 'NEXT_PUBLIC_RESUME_UNLIMITED_PRICE_ID',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function logHeader(title) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'═'.repeat(60)}\n`);
}

function logStep(msg) {
  console.log(`  ▸ ${msg}`);
}

function logSuccess(msg) {
  console.log(`  ✅ ${msg}`);
}

function logError(msg) {
  console.log(`  ❌ ${msg}`);
}

function logInfo(msg) {
  console.log(`  ℹ️  ${msg}`);
}

// ── Core: Create a single product + price ─────────────────────────────────────
async function createProduct(product, systemName) {
  const prefix = `[${systemName}]`;

  if (isDryRun) {
    logStep(`${prefix} Would create: "${product.name}" — $${(product.amountCents / 100).toFixed(2)} ${product.type === 'recurring' ? `/${product.interval}` : '(one-time)'}`);
    return {
      id: product.id,
      name: product.name,
      productId: 'prod_DRYRUN_xxx',
      priceId: 'price_DRYRUN_xxx',
      envVar: product.envVar,
      amount: product.amountCents / 100,
      type: product.type,
    };
  }

  try {
    // Step 1: Create the Stripe Product
    logStep(`${prefix} Creating product: "${product.name}"...`);
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: {
        system: systemName,
        product_id: product.id,
        product_type: product.type,
      },
    });
    logSuccess(`${prefix} Product created: ${stripeProduct.id}`);

    // Step 2: Create the Price
    logStep(`${prefix} Creating price: $${(product.amountCents / 100).toFixed(2)} ${product.type === 'recurring' ? `/${product.interval}` : '(one-time)'}...`);

    const priceParams = {
      unit_amount: product.amountCents,
      currency: 'usd',
      product: stripeProduct.id,
      metadata: {
        system: systemName,
        product_id: product.id,
      },
    };

    if (product.type === 'recurring') {
      priceParams.recurring = {
        interval: product.interval || 'month',
      };
    }

    const stripePrice = await stripe.prices.create(priceParams);
    logSuccess(`${prefix} Price created: ${stripePrice.id}`);

    return {
      id: product.id,
      name: product.name,
      productId: stripeProduct.id,
      priceId: stripePrice.id,
      envVar: product.envVar,
      amount: product.amountCents / 100,
      type: product.type,
    };
  } catch (error) {
    logError(`${prefix} Failed to create "${product.name}": ${error.message}`);
    if (error.code === 'resource_already_exists') {
      logInfo('Product already exists. Check your Stripe dashboard.');
    }
    return {
      id: product.id,
      name: product.name,
      productId: null,
      priceId: null,
      envVar: product.envVar,
      amount: product.amountCents / 100,
      type: product.type,
      error: error.message,
    };
  }
}

// ── Core: Create webhook endpoint ─────────────────────────────────────────────
async function createWebhookEndpoint(url, events, systemName) {
  if (isDryRun) {
    logStep(`[Webhook] Would create endpoint: ${url}`);
    logStep(`[Webhook] Events: ${events.join(', ')}`);
    return { id: 'we_DRYRUN_xxx', secret: 'whsec_DRYRUN_xxx', url };
  }

  try {
    // Check if endpoint already exists
    const existing = await stripe.webhookEndpoints.list({ limit: 100 });
    const found = existing.data.find(e => e.url === url);
    if (found) {
      logInfo(`[Webhook] Endpoint already exists: ${found.id}`);
      logInfo(`[Webhook] Secret: ${found.secret.slice(0, 12)}... (copy from dashboard if needed)`);
      return { id: found.id, secret: found.secret, url, alreadyExisted: true };
    }

    const endpoint = await stripe.webhookEndpoints.create({
      url,
      enabled_events: events,
      description: `Emergency Income Systems — ${systemName} webhook`,
      metadata: { system: systemName },
    });

    logSuccess(`[Webhook] Created: ${endpoint.id}`);
    logSuccess(`[Webhook] Secret: ${endpoint.secret}`);
    return { id: endpoint.id, secret: endpoint.secret, url };
  } catch (error) {
    logError(`[Webhook] Failed to create: ${error.message}`);
    return { id: null, secret: null, url, error: error.message };
  }
}

// ── Core: Update .env.local file ──────────────────────────────────────────────
function updateEnvLocal(filePath, priceResults, webhookSecret, systemName) {
  logStep(`Updating ${path.basename(filePath)}...`);

  if (isDryRun) {
    logInfo(`[DRY RUN] Would update: ${filePath}`);
    return;
  }

  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  } else {
    logInfo(`File not found, creating: ${filePath}`);
    content = `# ${systemName} — Environment Config\n# Auto-generated by setup-emergency-income-stripe.js\n`;
  }

  // Update each price ID
  for (const result of priceResults) {
    if (!result.priceId) {
      logError(`Skipping ${result.envVar} — no price ID (creation failed)`);
      continue;
    }

    const envLine = `${result.envVar}=${result.priceId}`;

    // Replace existing line or append
    const regex = new RegExp(`^${result.envVar}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, envLine);
      logSuccess(`Updated: ${result.envVar}=${result.priceId}`);
    } else {
      content += `\n${envLine}`;
      logSuccess(`Added: ${envLine}`);
    }
  }

  // Update webhook secret
  if (webhookSecret) {
    const webhookLine = `STRIPE_WEBHOOK_SECRET=${webhookSecret}`;
    const webhookRegex = /^STRIPE_WEBHOOK_SECRET=.*$/m;
    if (webhookRegex.test(content)) {
      content = content.replace(webhookRegex, webhookLine);
      logSuccess(`Updated: STRIPE_WEBHOOK_SECRET`);
    } else {
      content += `\n${webhookLine}`;
      logSuccess(`Added: ${webhookLine}`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  logSuccess(`Saved: ${filePath}`);
}

// ── Main orchestrator ─────────────────────────────────────────────────────────
async function main() {
  const envMode = isLiveMode ? '🔴 LIVE' : '🟢 TEST';
  logHeader(`Emergency Income Systems — Stripe Setup [${envMode}${isDryRun ? ' | DRY RUN' : ''}]`);

  console.log(`  Stripe Key: ${STRIPE_SECRET_KEY.slice(0, 8)}...${STRIPE_SECRET_KEY.slice(-4)}`);
  console.log(`  Mode: ${isLiveMode ? 'LIVE — real charges!' : 'TEST — safe to experiment'}`);
  console.log(`  Dry Run: ${isDryRun ? 'YES (no API calls)' : 'NO (will create resources)'}`);

  if (isLiveMode && !isDryRun) {
    console.log('\n  ⚠️  WARNING: You are about to create LIVE products and prices!');
    console.log('  Real customers will be able to purchase these immediately.');
  }

  // ── Verify Stripe connection ──────────────────────────────────────────────
  if (!isDryRun) {
    try {
      const account = await stripe.accounts.retrieve();
      logSuccess(`Connected to Stripe account: ${account.business_profile?.name || account.id}`);
    } catch (error) {
      logError(`Cannot connect to Stripe: ${error.message}`);
      process.exit(1);
    }
  }

  // ── Create DigitalProductStore products ───────────────────────────────────
  logHeader('System 1: DigitalProductStore — 5 One-Time Products');
  const storeResults = [];
  for (const product of DIGITAL_PRODUCT_STORE_PRODUCTS) {
    const result = await createProduct(product, 'DigitalProductStore');
    storeResults.push(result);
  }

  // ── Create ResumeScannerSaaS products ─────────────────────────────────────
  logHeader('System 2: ResumeScannerSaaS — 1 One-Time + 1 Subscription');
  const saasResults = [];
  for (const product of RESUME_SCANNER_PRODUCTS) {
    const result = await createProduct(product, 'ResumeScannerSaaS');
    saasResults.push(result);
  }

  // ── Create webhook endpoints ──────────────────────────────────────────────
  logHeader('Webhook Endpoints');

  const storeWebhook = await createWebhookEndpoint(
    'http://localhost:3001/api/webhooks/stripe',
    ['checkout.session.completed'],
    'DigitalProductStore'
  );

  const saasWebhook = await createWebhookEndpoint(
    'http://localhost:3002/api/webhooks/stripe',
    ['checkout.session.completed', 'customer.subscription.created', 'customer.subscription.deleted'],
    'ResumeScannerSaaS'
  );

  // ── Update .env.local files ───────────────────────────────────────────────
  logHeader('Updating Environment Files');

  const storeEnvPath = path.resolve(__dirname, '..', 'DigitalProductStore', '.env.local');
  const saasEnvPath = path.resolve(__dirname, '..', 'ResumeScannerSaaS', '.env.local');

  updateEnvLocal(storeEnvPath, storeResults, storeWebhook.secret, 'DigitalProductStore');
  updateEnvLocal(saasEnvPath, saasResults, saasWebhook.secret, 'ResumeScannerSaaS');

  // ── Summary ───────────────────────────────────────────────────────────────
  logHeader('Setup Complete — Summary');

  console.log('\n  📦 DigitalProductStore Products:');
  for (const r of storeResults) {
    const status = r.priceId ? '✅' : '❌';
    const priceDisplay = r.priceId ? r.priceId : '(failed)';
    console.log(`    ${status} ${r.name} — $${r.amount.toFixed(2)} → ${priceDisplay}`);
  }

  console.log('\n  📦 ResumeScannerSaaS Products:');
  for (const r of saasResults) {
    const status = r.priceId ? '✅' : '❌';
    const priceDisplay = r.priceId ? r.priceId : '(failed)';
    const typeLabel = r.type === 'recurring' ? '/mo' : 'one-time';
    console.log(`    ${status} ${r.name} — $${r.amount.toFixed(2)} ${typeLabel} → ${priceDisplay}`);
  }

  console.log('\n  🔗 Webhooks:');
  console.log(`    DigitalProductStore: ${storeWebhook.id || '(failed)'} → http://localhost:3001/api/webhooks/stripe`);
  console.log(`    ResumeScannerSaaS:   ${saasWebhook.id || '(failed)'} → http://localhost:3002/api/webhooks/stripe`);

  // ── Save config JSON ──────────────────────────────────────────────────────
  const configPath = path.resolve(__dirname, '..', 'STRIPE_EMERGENCY_INCOME_CONFIG.json');
  const config = {
    created_at: new Date().toISOString(),
    environment: isLiveMode ? 'live' : 'test',
    dry_run: isDryRun,
    digital_product_store: {
      products: storeResults,
      webhook: storeWebhook,
      env_file: storeEnvPath,
    },
    resume_scanner_saas: {
      products: saasResults,
      webhook: saasWebhook,
      env_file: saasEnvPath,
    },
    next_steps: [
      '1. Verify products in Stripe Dashboard',
      '2. Start dev servers: npm run dev (in each system directory)',
      '3. For local webhook testing: stripe listen --forward-to localhost:3001/api/webhooks/stripe',
      '4. Test payments with card: 4242 4242 4242 4242',
      '5. For production: update webhook URLs to production domain',
    ],
  };

  if (!isDryRun) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`\n  📄 Full config saved to: ${configPath}`);
  }

  console.log('\n  📋 Next Steps:');
  config.next_steps.forEach(s => console.log(`    ${s}`));

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  Done! Both systems are ready for Stripe integration.');
  console.log(`${'═'.repeat(60)}\n`);
}

// ── Run ───────────────────────────────────────────────────────────────────────
main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
