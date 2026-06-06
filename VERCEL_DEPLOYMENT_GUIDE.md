# Vercel Deployment Guide - J3C Family Studio

**Version:** 1.0.0
**Date:** 2026-06-06
**Deployment Target:** Vercel Platform
**Domain:** j3cfamily.studio (with subdomains)

---

## 🏗️ Architecture Overview

```
j3cfamily.studio          → ContentRepurposingEngine (main app - landing + content tool)
store.j3cfamily.studio    → DigitalProductStore (digital product marketplace)
resume.j3cfamily.studio   → ResumeScannerSaaS (ATS resume scoring SaaS)
```

Each app is deployed as a **separate Vercel project** with its own vercel.json configuration.

---

## 📋 Pre-Deployment Checklist

### Build Validation Results (2026-06-06)

| App | Status | Pages | API Routes | Errors |
|-----|--------|-------|------------|--------|
| ContentRepurposingEngine | ✅ PASS | 12/12 | 5 serverless | 0 |
| DigitalProductStore | ✅ PASS | 8/8 | 2 serverless | 0 |
| ResumeScannerSaaS | ✅ PASS | 9/9 | 3 serverless | 0 |

### Files Changed for Deployment
- `ContentRepurposingEngine/next.config.js` - Removed static export, enabled serverless functions
- `ContentRepurposingEngine/tsconfig.json` - Added exclusions for sub-project directories
- `ContentRepurposingEngine/app/page.tsx` - Updated to J3C Family Studio landing page
- `ContentRepurposingEngine/app/layout.tsx` - Updated metadata for main domain
- `ContentRepurposingEngine/vercel.json` - Created (new file)

---

## 🌐 DNS Configuration

### Step 1: Point Domain to Vercel

In your domain registrar's DNS settings for **j3cfamily.studio**:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 300 (5 minutes)
```

### Step 2: Configure Subdomain Records

```
Type: CNAME
Name: store
Value: cname.vercel-dns.com
TTL: 300

Type: CNAME
Name: resume
Value: cname.vercel-dns.com
TTL: 300
```

**Alternative (A records for subdomains):**
```
Type: A
Name: store
Value: 76.76.21.21
TTL: 300

Type: A
Name: resume
Value: 76.76.21.21
TTL: 300
```

### Step 3: Verify DNS Propagation

After setting DNS records, verify propagation:
```bash
nslookup j3cfamily.studio
nslookup store.j3cfamily.studio
nslookup resume.j3cfamily.studio
```

All should resolve to `76.76.21.21` (Vercel's IP).

---

## 🔧 Vercel Project Setup

### Project 1: Main Site (j3cfamily.studio)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import the `ContentRepurposingEngine` directory
3. Framework Preset: **Next.js**
4. Build Command: `npm run build`
5. Output Directory: `.next`
6. Install Command: `npm ci`

**Domain Configuration:**
- Add domain: `j3cfamily.studio`
- Vercel will auto-detect DNS records and provision SSL

### Project 2: Digital Product Store (store.j3cfamily.studio)

1. Create new Vercel project from `ContentRepurposingEngine/DigitalProductStore`
2. Framework Preset: **Next.js**
3. Domain: `store.j3cfamily.studio`

### Project 3: Resume Scanner SaaS (resume.j3cfamily.studio)

1. Create new Vercel project from `ContentRepurposingEngine/ResumeScannerSaaS`
2. Framework Preset: **Next.js**
3. Domain: `resume.j3cfamily.studio`

---

## 🔑 Environment Variables (Per Project)

### Main App (j3cfamily.studio) - ContentRepurposingEngine

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `NODE_ENV` | `production` | ✅ Auto-set by vercel.json | - |
| `NEXT_PUBLIC_APP_URL` | `https://j3cfamily.studio` | ✅ Auto-set by vercel.json | - |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | `https://cloud.appwrite.io/v1` | ⚠️ Set before launch | Appwrite API |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | `<your-project-id>` | ⚠️ Set before launch | From Appwrite dashboard |
| `APPWRITE_API_KEY` | `<secret>` | ⚠️ Set before launch | Server-side only |
| `LM_STUDIO_URL` | `http://localhost:1234/v1` | ❌ Optional | Local AI fallback |
| `OPENAI_API_KEY` | `<secret>` | ❌ Optional | OpenAI API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | ⚠️ Set before Stripe config | Stripe dashboard |
| `STRIPE_SECRET_KEY` | `sk_live_...` | ⚠️ Set before Stripe config | Server-side only |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ⚠️ Set after webhook URL known | From Stripe dashboard |
| `STRIPE_BASIC_PRICE_ID` | `price_...` | ⚠️ Create in Stripe | Monthly basic plan |
| `STRIPE_PRO_PRICE_ID` | `price_...` | ⚠️ Create in Stripe | Monthly pro plan |
| `STRIPE_AGENCY_PRICE_ID` | `price_...` | ⚠️ Create in Stripe | Monthly agency plan |
| `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID` | `price_...` | ⚠️ Same as above | Client-side access |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | `price_...` | ⚠️ Same as above | Client-side access |
| `NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID` | `price_...` | ⚠️ Same as above | Client-side access |
| `SENDGRID_API_KEY` | `<secret>` | ❌ Optional | Email delivery |
| `FROM_EMAIL` | `noreply@j3cfamily.studio` | ❌ Optional | Sender email |
| `NEXT_PUBLIC_ANALYTICS_ID` | `<id>` | ❌ Optional | SimpleAnalytics |

### DigitalProductStore (store.j3cfamily.studio)

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `NODE_ENV` | `production` | ✅ Auto-set by vercel.json | - |
| `NEXT_PUBLIC_APP_URL` | `https://store.j3cfamily.studio` | ✅ Auto-set by vercel.json | - |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | ⚠️ Set before Stripe config | Same key as main app |
| `STRIPE_SECRET_KEY` | `sk_live_...` | ⚠️ Set before Stripe config | Same key as main app |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ⚠️ Different from main app | Store-specific webhook |
| `SENDGRID_API_KEY` | `<secret>` | ❌ Optional | Email delivery |
| `FROM_EMAIL` | `store@j3cfamily.studio` | ❌ Optional | Sender email |

### ResumeScannerSaaS (resume.j3cfamily.studio)

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `NODE_ENV` | `production` | ✅ Auto-set by vercel.json | - |
| `NEXT_PUBLIC_APP_URL` | `https://resume.j3cfamily.studio` | ✅ Auto-set by vercel.json | - |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | ⚠️ Set before Stripe config | Same key as main app |
| `STRIPE_SECRET_KEY` | `sk_live_...` | ⚠️ Set before Stripe config | Same key as main app |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ⚠️ Different from main app | Resume-specific webhook |
| `OPENAI_API_KEY` | `<secret>` | ⚠️ For resume analysis | OpenAI API |
| `SENDGRID_API_KEY` | `<secret>` | ❌ Optional | Email delivery |

---

## 🔒 SSL Certificate Configuration

Vercel **automatically provisions and renews** SSL certificates for all configured domains. After adding your domain in Vercel:

1. Go to Project Settings → Domains
2. Click on each domain → "Verify" DNS configuration
3. Vercel will show certificate status (usually ready within minutes)
4. Force HTTPS redirect is enabled by default

**No manual SSL configuration needed.**

---

## 🚀 Deployment Steps (Ordered)

### Phase 1: Deploy Main Site (Priority 1)

```bash
# Option A: Using Vercel CLI (recommended for speed)
cd "ContentRepurposingEngine"
vercel login
vercel --prod

# Option B: Through Vercel Dashboard
# 1. Import repository/directory
# 2. Configure environment variables
# 3. Deploy
```

### Phase 2: Deploy Subdomains (Priority 2)

```bash
# Digital Product Store
cd "ContentRepurposingEngine/DigitalProductStore"
vercel --prod

# Resume Scanner SaaS
cd "ContentRepurposingEngine/ResumeScannerSaaS"
vercel --prod
```

### Phase 3: Configure Stripe Webhooks (After deployment)

1. Get deployed URLs from Vercel dashboard
2. In Stripe Dashboard → Developers → Webhooks:
   - Main app: `https://j3cfamily.studio/api/webhooks/stripe`
   - Store: `https://store.j3cfamily.studio/api/webhooks/stripe`
   - Resume: `https://resume.j3cfamily.studio/api/webhooks/stripe`
3. Copy webhook secrets back to Vercel environment variables

---

## ✅ Post-Deployment Smoke Tests

### Main Site (j3cfamily.studio)
```bash
curl -I https://j3cfamily.studio          # Should return 200
curl -I https://www.j3cfamily.studio      # Should redirect to j3cfamily.studio
curl https://j3cfamily.studio/api/generate-posts -X POST -H "Content-Type: application/json" -d '{"content":"test","email":"test@test.com"}'  # Should return JSON or error (not 500)
```

### Subdomains
```bash
curl -I https://store.j3cfamily.studio    # Should return 200
curl -I https://resume.j3cfamily.studio   # Should return 200
```

### SSL Verification
```bash
# Verify HTTPS is working
openssl s_client -connect j3cfamily.studio:443 -servername j3cfamily.studio
openssl s_client -connect store.j3cfamily.studio:443 -servername store.j3cfamily.studio
openssl s_client -connect resume.j3cfamily.studio:443 -servername resume.j3cfamily.studio
```

---

## 🔄 Rollback Procedures

### Quick Rollback (Vercel Dashboard)
1. Go to Vercel Project → Deployments
2. Find the previous successful deployment
3. Click "Promote to Production"

### Rollback via CLI
```bash
vercel rollback <deployment-url>
```

### Configuration Rollback Points
- `next.config.js`: Revert removal of `output: 'export'` if serverless functions fail
- `tsconfig.json`: Remove exclusions if sub-project files need to be included
- `vercel.json`: Delete and let Vercel auto-detect settings

---

## 📊 Monitoring & Alerts

### Vercel Analytics
Enable in Project Settings → Analytics for:
- Page load times
- Route performance
- Error tracking

### Stripe Dashboard
Monitor:
- Webhook delivery status
- Payment success rates
- Subscription metrics

---

## ⚠️ Known Limitations

1. **Stripe webhooks require live URLs** - Cannot test webhooks until domain is deployed and DNS propagated
2. **Appwrite functions not included** - Backend logic relies on Appwrite cloud functions (separate deployment)
3. **Email delivery requires SendGrid setup** - Nodemailer configured but needs production credentials
4. **LM Studio only works locally** - Production will need OpenAI API key for AI features

---

## 📞 Support & Contacts

- Vercel Docs: https://vercel.com/docs
- Stripe Webhook Setup: https://stripe.com/docs/webhooks/setup
- DNS Propagation Check: https://dnschecker.org/
