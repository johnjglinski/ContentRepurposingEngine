# Environment Variable Checklist - J3C Family Studio

**Quick Reference for Vercel Deployment (2026-06-06)**

---

## 🟢 Auto-Configured (via vercel.json)

These are set automatically in each project's vercel.json:

| Project | Variable | Value |
|---------|----------|-------|
| Main App | `NODE_ENV` | `production` |
| Main App | `NEXT_PUBLIC_APP_URL` | `https://j3cfamily.studio` |
| Store | `NODE_ENV` | `production` |
| Store | `NEXT_PUBLIC_APP_URL` | `https://store.j3cfamily.studio` |
| Resume | `NODE_ENV` | `production` |
| Resume | `NEXT_PUBLIC_APP_URL` | `https://resume.j3cfamily.studio` |

---

## 🔴 Must Set in Vercel Dashboard (Before Launch)

### Shared Across All Projects
| Variable | Where to Get | Set In |
|----------|-------------|--------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys (pk_live_...) | All 3 projects |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys (sk_live_...) | All 3 projects |

### Main App Only (ContentRepurposingEngine)
| Variable | Where to Get | Notes |
|----------|-------------|-------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Use default: `https://cloud.appwrite.io/v1` | - |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite Dashboard → Project Settings | Required for auth |
| `APPWRITE_API_KEY` | Appwrite Dashboard → API Keys | Server-side only (Encrypted) |

### Store Only (DigitalProductStore)
| Variable | Where to Get | Notes |
|----------|-------------|-------|
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → After registering URL | Unique per project |

### Resume Only (ResumeScannerSaaS)
| Variable | Where to Get | Notes |
|----------|-------------|-------|
| `OPENAI_API_KEY` | OpenAI Dashboard → API Keys | For resume analysis AI |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → After registering URL | Unique per project |

---

## 🟡 Set After Deployment (Stripe Webhook URLs)

After deploying, register these webhook endpoints in Stripe Dashboard:

1. `https://j3cfamily.studio/api/webhooks/stripe`
2. `https://store.j3cfamily.studio/api/webhooks/stripe`
3. `https://resume.j3cfamily.studio/api/webhooks/stripe`

Then copy the generated `whsec_...` secrets back to each project's Vercel env vars.

---

## 🟢 Optional (Enhanced Features)

| Variable | Purpose | Set In |
|----------|---------|--------|
| `OPENAI_API_KEY` | AI content generation | Main App, Resume |
| `SENDGRID_API_KEY` | Email delivery | All 3 projects |
| `FROM_EMAIL` | Sender email address | All 3 projects |
| `NEXT_PUBLIC_ANALYTICS_ID` | SimpleAnalytics tracking | Main App |

---

## ⚡ Quick Setup Commands

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy main app
cd "ContentRepurposingEngine"
vercel --prod

# Deploy store (from parent directory)
cd "DigitalProductStore"
vercel --prod

# Deploy resume scanner (from parent directory)
cd "../ResumeScannerSaaS"
vercel --prod
```

After each deployment, Vercel CLI will prompt for environment variables. Have the values ready from the tables above.
