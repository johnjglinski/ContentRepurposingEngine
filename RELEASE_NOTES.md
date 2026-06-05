# Release Notes — Content Repurposing Engine v1.0.0

**Release Date:** 2026-06-05
**Build Type:** Production (Static Export)
**Framework:** Next.js 14.0.4 + TypeScript 5.x

---

## 🎯 Overview

Content Repurposing Engine is an AI-powered web application that transforms blog posts into optimized social media content for multiple platforms. This initial release provides core content generation, Stripe subscription billing, email delivery, and usage analytics.

---

## ✨ Features

### Content Generation
- Blog-to-social-media post conversion using OpenAI GPT-4
- Platform-specific optimization (Twitter/X, LinkedIn, Facebook, Instagram)
- Character limit enforcement (<280 chars per post)
- Automatic hashtag generation
- Email delivery of generated posts via SendGrid

### Subscription & Billing
- Stripe-powered subscription management
- Three-tier pricing plans (Free, Pro, Enterprise)
- Checkout session creation with Stripe.js
- Webhook handling for subscription lifecycle events
- Success/cancel pages for checkout flow

### Analytics & Monitoring
- SimpleAnalytics integration for privacy-first tracking
- Usage tracking endpoint (`/api/track-usage`)
- Application Insights readiness (Azure Functions)

---

## 📦 Technical Summary

### Architecture
```
┌─────────────────┐     ┌──────────────────┐
│   GitHub Pages  │────▶│  Azure Functions  │
│  (Static Frontend) │     │  (Backend API)    │
└─────────────────┘     └──────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   OpenAI GPT-4    │
                    └───────────────────┘
                    ┌─────────▼─────────┐
                    │    SendGrid       │
                    │  (Email Delivery) │
                    └───────────────────┘
```

### Pages (Static Export)
| Route | Type | Size | First Load JS |
|-------|------|------|---------------|
| `/` (Home) | Static | 6.06 kB | 96 kB |
| `/dashboard` | Static | 4.9 kB | 94.8 kB |
| `/success` | Static | 2.34 kB | 92.2 kB |
| `/cancel` | Static | 2.1 kB | 92 kB |
| `/_not-found` (404) | Static | 869 B | 82.9 kB |

### API Routes (Serverless — Azure Functions)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/generate-posts` | POST | AI content generation |
| `/api/create-checkout-session` | POST | Stripe checkout |
| `/api/send-email` | POST | Email delivery |
| `/api/track-usage` | POST/GET | Usage analytics |
| `/api/webhooks/stripe` | POST | Payment webhooks |

### Shared JS Bundle
- Main app chunk: 82 kB (shared across all pages)
- Webpack runtime: 1.74 kB

---

## 🔧 Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.0.4 | React framework |
| react / react-dom | ^18 | UI library |
| openai | ^4.20.1 | AI API client |
| stripe | ^14.9.0 | Payment processing |
| @stripe/stripe-js | ^9.7.0 | Client-side Stripe |
| nodemailer | ^6.9.7 | Email transport |
| tailwindcss | ^3.3.0 | CSS framework |
| lucide-react | ^0.294.0 | Icon library |

### Azure Functions Backend
| Package | Version | Purpose |
|---------|---------|---------|
| @azure/functions | ^4.0.0 | Azure Functions runtime |
| openai | ^4.20.1 | AI API client |
| nodemailer | ^6.9.7 | Email transport |

---

## ⚙️ Environment Requirements

### Required Variables
```env
# OpenAI
OPENAI_API_KEY=sk-prod-...

# Stripe (Production keys for live mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG.verified_key
FROM_EMAIL=noreply@yourdomain.com

# Azure Functions Backend
AZURE_FUNCTION_URL=https://<function-app>.azurewebsites.net/api

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=<simpleanalytics_id>
```

### Node.js Version
- **Required:** Node.js 18.x (as specified in GitHub Actions workflow)
- **Recommended:** Node.js 20.x LTS for Azure Functions

---

## 🚨 Known Issues

1. **API routes not served on GitHub Pages** — Static export cannot serve Next.js API routes; Azure Functions backend is required for all server-side functionality.
2. **Environment variable naming inconsistency** — `STRIPE_PUBLISHABLE_KEY` in `.env.local` should be `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. **Stub implementations** — Subscription handling, user access control, and failed payment recovery are logged but not fully implemented (marked as TODO).
4. **No authentication layer** — The application does not enforce user authentication; all features are publicly accessible.

---

## 🔄 Migration from Test to Production

### Stripe
1. Switch from `pk_test_` / `sk_test_` keys to `pk_live_` / `sk_live_` keys
2. Create new webhook endpoint in Stripe Dashboard pointing to production URL
3. Copy new production webhook secret (`whsec_...`)
4. Create live pricing plans and products in Stripe

### SendGrid
1. Verify production domain in SendGrid
2. Update `FROM_EMAIL` to use verified production domain
3. Request API key upgrade if sending volume exceeds free tier

### OpenAI
1. Ensure API key has sufficient credits/quota for production usage
2. Consider implementing rate limiting on `/api/generate-posts`

---

## 📋 Rollback Plan

- **Frontend:** Revert to previous git commit and push to trigger GitHub Pages redeployment
- **Backend:** Use Azure deployment slots for zero-downtime rollback
- **Environment:** Maintain encrypted backup of all secrets; restore from version-controlled vault

---

## 👥 Credits

- Built with Next.js, Tailwind CSS, OpenAI GPT-4, Stripe, and SendGrid
- Deployed on GitHub Pages (frontend) + Azure Functions (backend)
- Analytics via SimpleAnalytics (privacy-first)
