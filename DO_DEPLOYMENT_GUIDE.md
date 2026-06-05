# DigitalOcean App Platform Deployment Guide

## Overview

This guide covers deploying the Content Repurposing Engine to DigitalOcean App Platform as a **service** (not static site). Next.js 14 App Router with `'use client'` components requires a running Node.js server.

**Architecture**: Next.js Service → Appwrite Cloud API (`https://sfo.cloud.appwrite.io/v1`)

---

## Prerequisites

1. **DigitalOcean Account** — Sign up at https://cloud.digitalocean.com/
2. **doctl CLI** — Install from https://docs.digitalocean.com/reference/doctl/install/
3. **GitHub Repository** — Code pushed to `main` branch
4. **Appwrite Backend** — Already running on Appwrite Cloud

---

## Step 1: Configure DigitalOcean Account

1. Log in to https://cloud.digitalocean.com/
2. Navigate to **Billing → Payment Methods** and add a payment method
3. Note: Basic-XXS service starts at ~$5/month

---

## Step 2: Authenticate doctl

```bash
doctl auth init
# Follow the browser prompt to authenticate
```

Verify authentication:
```bash
doctl auth list
```

---

## Step 3: Update app.yaml

Edit `app.yaml` and replace `<YOUR_GITHUB_USERNAME>` with your GitHub username:

```yaml
git:
  branch: main
  repo_clone_spec: github/your-username/ContentRepurposingEngine
```

---

## Step 4: Set Environment Variables in DigitalOcean Dashboard

After creating the app, go to **App → Settings → Environment Variables** and add all variables from `.env.digitalocean`:

### Required Variables

| Variable | Value | Scope | Type |
|----------|-------|-------|------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | `https://sfo.cloud.appwrite.io/v1` | Run+Build | General |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Your Appwrite project ID | Run+Build | **Secret** |
| `APPWRITE_API_KEY` | Your Appwrite API key | Run+Build | **Secret** |
| `NEXT_PUBLIC_APP_URL` | Your DO domain (update after deploy) | Run+Build | General |

### Stripe Variables

| Variable | Value | Scope | Type |
|----------|-------|-------|------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Live publishable key | Run+Build | **Secret** |
| `STRIPE_SECRET_KEY` | Live secret key | Run+Build | **Secret** |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Run+Build | **Secret** |

### Optional Variables (SendGrid, LM Studio, Analytics)

See `.env.digitalocean` for the complete list.

---

## Step 5: Deploy

### Option A: Using doctl CLI
```bash
cd ContentRepurposingEngine
doctl apps create --spec app.yaml --project content-repurposing-engine
```

### Option B: Using Deployment Scripts
**Windows:**
```cmd
scripts\deploy-do.bat
```

**Mac/Linux:**
```bash
chmod +x scripts/deploy-do.sh
./scripts/deploy-do.sh
```

### Option C: DigitalOcean Dashboard
1. Go to **Apps → Create App**
2. Connect your GitHub repository
3. Select the `main` branch
4. Configure as a **Service** component (not Static Site)
5. Set build command: `npm ci && npm run build`
6. Set run command: `npm start`
7. Add all environment variables from Step 4
8. Click **Create Resources**

---

## Step 6: Monitor Deployment

```bash
# Replace <app-id> with your actual app ID
doctl apps logs <app-id> --follow
```

Or monitor at https://cloud.digitalocean.com/apps

Deployment typically takes 3-5 minutes.

---

## Step 7: Post-Deployment Smoke Tests

Run the smoke test script after deployment completes:

```bash
cd ContentRepurposingEngine/scripts
node smoke-test-do.js
```

### Manual Verification Checklist

- [ ] Homepage loads (200 OK) at `https://<app>.ondigitalocean.app`
- [ ] Dashboard page renders correctly (`/dashboard`)
- [ ] Success/Cancel pages load (`/success`, `/cancel`)
- [ ] 404 handling works for unknown routes
- [ ] SSL certificate is active (HTTPS enforced)
- [ ] Appwrite API calls succeed from the frontend
- [ ] Stripe checkout flow initiates correctly
- [ ] Health check at `/` returns 200

---

## Step 8: Configure Custom Domain (Optional)

1. Go to **App → Settings → Domains** in DO dashboard
2. Add your custom domain
3. Update DNS records at your registrar:
   - **A record**: `204.93.56.1` (DigitalOcean edge IP)
   - Or **CNAME**: Point to the DO-provided CNAME target
4. SSL is automatically provisioned by DigitalOcean (Let's Encrypt)

Update `NEXT_PUBLIC_APP_URL` in environment variables after domain propagation.

---

## Cost Estimate

| Component | Plan | Monthly Cost |
|-----------|------|-------------|
| Next.js Service (basic-xxs) | 1 instance | ~$5/month |
| Appwrite Backend | Cloud Free Tier | Free |
| Custom Domain | N/A | Your registrar fee |
| **Total** | | **~$5/month** |

---

## Rollback Procedure

See `DO_ROLLBACK_NOTES.md` for detailed rollback procedures.

Quick rollback:
1. Go to **App → Deployments** in DO dashboard
2. Find the last successful deployment (green checkmark)
3. Click **Promote to Production**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails in DO | Check build logs; ensure `npm ci` works with your lockfile |
| Service won't start | Verify `PORT` env var is used (DO sets this automatically; Next.js respects it) |
| Environment variables not applied | Ensure scope is `RUN_AND_BUILD_TIME` for NEXT_PUBLIC vars |
| SSL certificate pending | Wait up to 24 hours; check DNS propagation |
| Appwrite API errors | Verify endpoint (`https://sfo.cloud.appwrite.io/v1`) and project ID |
| Health check fails | Ensure homepage route returns 200 |

---

## File Reference

| File | Purpose |
|------|---------|
| `app.yaml` | DigitalOcean App Platform specification (service-based) |
| `.do/deploy.yaml` | DO CLI deployment configuration |
| `.env.digitalocean` | Complete environment variable template |
| `scripts/deploy-do.bat` | Windows deployment script |
| `scripts/deploy-do.sh` | Mac/Linux deployment script |
| `scripts/smoke-test-do.js` | Post-deployment smoke tests |
| `DO_ROLLBACK_NOTES.md` | Rollback procedures |
| `DO_RELEASE_NOTES.md` | Release notes for this deployment |
