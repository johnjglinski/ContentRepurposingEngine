# Emergency Income Systems - Deployment Guide

## Overview

Two income-generating Next.js apps built on the ContentRepurposingEngine codebase:
- **DigitalProductStore** (`/store`) - Port 3001 - Digital product sales ($7-$12)
- **ResumeScannerSaaS** (`/resume`) - Port 3002 - AI resume scoring (free + $3/$9/mo)

---

## Pre-Launch Checklist

### Stripe Setup (Both Systems)
1. Create Stripe account → Dashboard → Products
2. **DigitalProductStore**: Create 5 one-time payment products ($7, $9, $12, $7, $9)
3. **ResumeScannerSaaS**: Create 1 one-time product ($3 scan) + 1 subscription ($9/mo unlimited)
4. Copy Price IDs into each project's `.env.local`
5. Set up Stripe webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

### AI Setup (ResumeScannerSaaS Only)
- Option A: Run LM Studio locally (free) → set `LM_STUDIO_URL=http://localhost:1234/v1`
- Option B: Use OpenAI API → set `OPENAI_API_KEY=sk-your-key`
- Without either, mock analysis works for testing

### Product Files (DigitalProductStore Only)
Replace placeholder files in `DigitalProductStore/public/products/`:
- Create actual PDFs with real prompt templates and checklists
- Each product should deliver genuine value (~30 min creation per product)

---

## Deployment Options

### Option 1: DigitalOcean Droplet (Recommended - $6/mo shared)

```bash
# On your droplet, install Node.js if not present
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone/deploy both apps
cd /var/www
git clone <your-repo>
cd ContentRepurposingEngine

# Build both apps
cd DigitalProductStore && npm install && npm run build:clean
cd ../ResumeScannerSaaS && npm install && npm run build:clean

# Set up PM2 to run both servers
npm install -g pm2
pm2 start "npx next start -p 3001" --name store
pm2 start "npx next start -p 3002" --name resume
pm2 save && pm2 startup

# Set up Nginx reverse proxy for /store and /resume paths
```

**Nginx config example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /store/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /resume/ {
        proxy_pass http://localhost:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Existing CRE at root
    location / {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
    }
}
```

### Option 2: Vercel Hobby Tier (Free)

1. Push each project to separate GitHub repos
2. Import both repos into Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Option 3: Separate Subdomains

- `store.yourdomain.com` → DigitalProductStore
- `resume.yourdomain.com` → ResumeScannerSaaS
- Configure DNS CNAME records to point to your hosting provider

---

## Switching from Test to Live Stripe

1. Replace test keys with live keys in `.env.local`:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
2. Create new webhook with live endpoint
3. Copy new `STRIPE_WEBHOOK_SECRET` to env
4. Test a real $1 purchase before launching

---

## Post-Launch Week 1 Routine (30 min/day)

| Day | Action | Time | System |
|-----|--------|------|--------|
| Mon | Post on r/sidehustle about prompt packs | 15 min | Store |
| Tue | Tweet thread about ATS resume scoring | 15 min | SaaS |
| Wed | Post on r/resumes with personal story + tool link | 15 min | SaaS |
| Thu | Share free sample prompt pack on Twitter | 10 min | Store |
| Fri | Check both Stripe dashboards; reply to emails | 15 min | Both |
| Sat | Create 1 new product for store | 20 min | Store |
| Sun | Review analytics; adjust pricing if needed | 15 min | Both |

---

## Troubleshooting

### Build fails with "headers not supported"
Remove `headers()` and `rewrites()` from next.config.js (static export limitation).

### Stripe checkout returns 404
Verify Price IDs in `.env.local` match your Stripe Dashboard exactly.

### PDF upload fails on ResumeScannerSaaS
Check that `pdf-parse` is installed: `npm list pdf-parse`

### Webhook not receiving events
1. Verify webhook URL is publicly accessible (not localhost)
2. Check webhook secret matches between Stripe and `.env.local`
3. Test with Stripe CLI: `stripe listen --forward-to localhost:3001/api/webhooks/stripe`

---

## Revenue Tracking

Monitor these metrics weekly:
- **Store**: Products sold, average order value, refund rate (<2% target)
- **SaaS**: Free scans → paid conversion rate (target 5-9%), MRR growth, churn rate
- **Combined**: Total net revenue vs. $421-$930 Month 1 projection
