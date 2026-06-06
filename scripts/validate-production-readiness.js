#!/usr/bin/env node
/**
 * Production Readiness Validator — Emergency Income Systems
 * ==========================================================
 * Validates both DigitalProductStore and ResumeScannerSaaS are ready for production.
 * Checks: environment variables, dependencies, build config, file structure.
 *
 * Usage:
 *   node scripts/validate-production-readiness.js [--verbose]
 */

const fs = require('fs');
const path = require('path');

// ── Helpers ────────────────────────────────────────────────────────────────────
let verbose = process.argv.includes('--verbose');
let passed = 0;
let failed = 0;
let warnings = 0;

function log(msg) { console.log(msg); }
function logVerbose(msg) { if (verbose) console.log(msg); }
function check(label, condition, detail = '') {
  if (condition) {
    passed++;
    log(`  ✅ ${label}`);
    if (detail && verbose) log(`     → ${detail}`);
  } else {
    failed++;
    log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
  }
}
function warn(label, detail = '') {
  warnings++;
  log(`  ⚠️  ${label}${detail ? ' — ' + detail : ''}`);
}

// ── App Definitions ────────────────────────────────────────────────────────────
const apps = [
  {
    name: 'DigitalProductStore',
    dir: path.resolve(__dirname, '..', 'DigitalProductStore'),
    envFile: '.env.local',
    requiredEnvVars: [
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_STORE_SOCIAL_PROMPTS_PRICE_ID',
      'NEXT_PUBLIC_STORE_CALENDAR_TEMPLATE_PRICE_ID',
      'NEXT_PUBLIC_STORE_RATE_CALCULATOR_PRICE_ID',
      'NEXT_PUBLIC_STORE_SIDE_HUSTLE_PROMPTS_PRICE_ID',
      'NEXT_PUBLIC_STORE_RESUME_BUILDER_PRICE_ID',
      'SENDGRID_API_KEY',
      'EMAIL_FROM'
    ],
    requiredFiles: [
      'package.json',
      'next.config.js',
      'vercel.json',
      'src/app/page.tsx',
      'src/app/api/create-checkout-session/route.ts',
      'src/app/api/webhooks/stripe/route.ts',
      'src/app/success/page.tsx',
      'src/app/cancel/page.tsx',
      'data/products.json'
    ],
    requiredDeps: ['next', 'stripe', '@stripe/stripe-js', 'nodemailer']
  },
  {
    name: 'ResumeScannerSaaS',
    dir: path.resolve(__dirname, '..', 'ResumeScannerSaaS'),
    envFile: '.env.local',
    requiredEnvVars: [
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_RESUME_SCAN_PRICE_ID',
      'NEXT_PUBLIC_RESUME_UNLIMITED_PRICE_ID',
      'OPENAI_API_KEY',
      'SENDGRID_API_KEY',
      'EMAIL_FROM'
    ],
    requiredFiles: [
      'package.json',
      'next.config.js',
      'vercel.json',
      'src/app/page.tsx',
      'src/app/api/create-checkout-session/route.ts',
      'src/app/api/webhooks/stripe/route.ts',
      'src/app/api/analyze-resume/route.ts',
      'src/app/success/page.tsx',
      'src/lib/resume-analyzer.ts'
    ],
    requiredDeps: ['next', 'stripe', '@stripe/stripe-js', 'openai', 'pdf-parse', 'nodemailer']
  }
];

// ── Validation Functions ───────────────────────────────────────────────────────

function validateNextConfig(app) {
  log(`\n📄 next.config.js — ${app.name}`);
  const configPath = path.join(app.dir, 'next.config.js');
  
  if (!fs.existsSync(configPath)) {
    check('File exists', false);
    return;
  }
  check('File exists', true);

  const content = fs.readFileSync(configPath, 'utf8');
  
  // Critical: must NOT have output: 'export'
  check('No static export (output: "export")', !content.includes("output: 'export'") && !content.includes('output: "export"'), 
    'Static export breaks API routes needed for Stripe webhooks');
  
  // Should have distDir configured
  check('distDir configured', content.includes('distDir'));
}

function validateEnvFile(app) {
  log(`\n🔑 Environment Variables — ${app.name}`);
  const envPath = path.join(app.dir, app.envFile);
  
  if (!fs.existsSync(envPath)) {
    check('.env.local exists', false);
    return;
  }
  check('.env.local exists', true);

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n').filter(l => !l.startsWith('#') && l.includes('='));
  
  for (const envVar of app.requiredEnvVars) {
    const found = lines.some(line => line.trim().startsWith(`${envVar}=`));
    
    // Check if value is still a placeholder
    let isPlaceholder = false;
    const matchLine = lines.find(line => line.trim().startsWith(`${envVar}=`));
    if (matchLine) {
      const value = matchLine.split('=')[1]?.trim() || '';
      isPlaceholder = value.includes('YOUR_') || value.includes('<') || value === '' || 
                      envVar.includes('STRIPE_PUBLISHABLE_KEY') && value.startsWith('pk_test_') ||
                      envVar.includes('SECRET_KEY') && (value.startsWith('sk_test_') || value.startsWith('sk_live_<')) ||
                      envVar.includes('WEBHOOK_SECRET') && value.startsWith('whsec_YOUR') ||
                      envVar.includes('PRICE_ID') && value.includes('YOUR_PRICE_ID') ||
                      envVar.includes('SENDGRID') && value.includes('YOUR_SENDGRID') ||
                      envVar.includes('OPENAI') && value.includes('your-openai-key');
    }
    
    if (!found) {
      check(`${envVar} defined`, false);
    } else if (isPlaceholder) {
      warn(`${envVar}`, 'Still contains placeholder value — replace before production deployment');
    } else {
      check(`${envVar} configured`, true, 'Value appears set');
    }
  }
}

function validateFileStructure(app) {
  log(`\n📁 File Structure — ${app.name}`);
  
  for (const file of app.requiredFiles) {
    const fullPath = path.join(app.dir, file);
    check(`${file}`, fs.existsSync(fullPath));
  }
}

function validateDependencies(app) {
  log(`\n📦 Dependencies — ${app.name}`);
  
  const pkgPath = path.join(app.dir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    check('package.json exists', false);
    return;
  }
  check('package.json exists', true);

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    // Check required dependencies
    for (const dep of app.requiredDeps) {
      const hasDep = pkg.dependencies && pkg.dependencies[dep];
      check(`Dependency: ${dep}`, hasDep);
    }
    
    // Check build scripts exist
    check('build script defined', !!pkg.scripts?.build);
    check('dev script defined', !!pkg.scripts?.dev);
    check('start script defined', !!pkg.scripts?.start);
    
  } catch (e) {
    check('package.json is valid JSON', false, e.message);
  }
}

function validateVercelConfig(app) {
  log(`\n☁️  Vercel Configuration — ${app.name}`);
  
  const vercelPath = path.join(app.dir, 'vercel.json');
  check('vercel.json exists', fs.existsSync(vercelPath));
  
  if (fs.existsSync(vercelPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
      check('framework set to nextjs', config.framework === 'nextjs');
      check('buildCommand defined', !!config.buildCommand);
      check('API rewrites configured', Array.isArray(config.rewrites) && config.rewrites.length > 0);
    } catch (e) {
      check('vercel.json is valid JSON', false, e.message);
    }
  }
}

function validateSecurity(app) {
  log(`\n🔒 Security — ${app.name}`);
  
  // Check .gitignore excludes .env files
  const gitignorePath = path.join(app.dir, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    check('.env.local in .gitignore', content.includes('.env.local') || content.includes('.env'));
  } else {
    warn('No .gitignore found', 'Ensure .env files are not committed to Git');
  }
}

// ── Run Validation ─────────────────────────────────────────────────────────────
log('═══════════════════════════════════════════════════════');
log('  Production Readiness Validator — Emergency Income Systems');
log('═══════════════════════════════════════════════════════\n');

for (const app of apps) {
  log(`\n${'='.repeat(50)}`);
  log(`  Validating: ${app.name}`);
  log(`${'='.repeat(50)}`);
  
  if (!fs.existsSync(app.dir)) {
    check('App directory exists', false, `Path: ${app.dir}`);
    continue;
  }
  check('App directory exists', true);
  
  validateNextConfig(app);
  validateEnvFile(app);
  validateFileStructure(app);
  validateDependencies(app);
  validateVercelConfig(app);
  validateSecurity(app);
}

// ── Summary ────────────────────────────────────────────────────────────────────
log(`\n${'='.repeat(50)}`);
log('  VALIDATION SUMMARY');
log(`${'='.repeat(50)}`);
log(`  ✅ Passed:   ${passed}`);
log(`  ❌ Failed:   ${failed}`);
log(`  ⚠️  Warnings: ${warnings}`);
log(`${'='.repeat(50)}\n`);

if (failed > 0) {
  log('❌ NOT READY FOR PRODUCTION — Fix the failures above before deploying.');
  process.exit(1);
} else if (warnings > 0) {
  log('⚠️  CAUTION — All critical checks passed, but there are warnings to address.');
  log('    Review environment variable placeholders before production deployment.');
  process.exit(0);
} else {
  log('✅ ALL CHECKS PASSED — Both systems are ready for production deployment!');
  process.exit(0);
}
