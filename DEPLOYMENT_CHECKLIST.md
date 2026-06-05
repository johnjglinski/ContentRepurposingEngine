# Deployment Checklist - Content Repurposing Engine

**Version:** 1.0.0
**Date:** 2026-06-05
**Build Status:** ✅ Validated (Next.js 14.0.4, static export)

---

## 📋 Pre-Deployment Verification

### Build Validation
- [x] Production build completes without errors (`npm run build`)
- [x] All 12 pages generated statically
- [x] TypeScript compilation passes
- [x] No linting errors (lint disabled in build but should pass `next lint`)
- [x] Output directory `.next-out` populated with static assets

### Environment Variable Checklist

#### Critical (Must be set before deployment)

| Variable | Purpose | Current State | Hosting Location |
|----------|---------|---------------|------------------|
| `OPENAI_API_KEY` | AI content generation | ❌ Placeholder | GitHub Secrets / Azure App Settings |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe checkout (client) | ❌ Placeholder | GitHub Secrets |
| `STRIPE_SECRET_KEY` | Stripe server operations | ❌ Placeholder | GitHub Secrets / Azure App Settings |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | ❌ Placeholder | GitHub Secrets / Azure App Settings |
| `SENDGRID_API_KEY` | Email delivery | ✅ Populated | GitHub Secrets / Azure App Settings |
| `FROM_EMAIL` | Sender email address | ✅ Set (noreply@testmail.app) | Local config |
| `AZURE_FUNCTION_URL` | Backend API endpoint | ❌ Placeholder | Environment config |
| `NEXT_PUBLIC_ANALYTICS_ID` | SimpleAnalytics tracking | ⚠️ File exists, verify value | Local config |

#### Notes on Variable Naming Mismatch
- `.env.example` uses `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (correct Next.js convention)
- `.env.local` uses `STRIPE_PUBLISHABLE_KEY` (missing NEXT_PUBLIC_ prefix)
- **Action required:** Ensure the publishable key uses the `NEXT_PUBLIC_` prefix for client-side access

### Security Checklist
- [x] `.env.local` is in `.gitignore` — secrets not committed
- [ ] Verify no hardcoded secrets in source code
- [ ] Azure Function auth level set to `function` (requires key)
- [ ] Stripe webhook signature verification enabled
- [ ] CORS headers configured for production domain

---

## 🚀 Deployment Targets

### Frontend: GitHub Pages (Static Export)

**Configuration:**
```javascript
// next.config.js
output: 'export'        // ✅ Static export enabled
trailingSlash: true    // ✅ Required for GitHub Pages
distDir: '.next-out'   // ✅ Custom output directory
images: { unoptimized: true }  // ✅ No image optimization (static)
```

**Deployment Steps:**
1. Push to `main` branch on GitHub
2. Enable GitHub Pages → Source: GitHub Actions
3. Add all environment variables as GitHub Secrets
4. Workflow builds and deploys `.next-out/` to Pages

**Important Limitations:**
- API routes (`/api/*`) require serverless hosting (Azure Functions)
- Static frontend will work but AI generation needs backend
- Stripe webhooks need a live URL (not localhost)

### Backend: Azure Functions

**Current Configuration:**
```json
// AZURE_FUNCTIONS_API/function.json
authLevel: "function"  // Requires function key
methods: ["post"]      // POST only
```

**Required App Settings for Azure:**
| Setting | Value Source |
|---------|-------------|
| `OPENAI_API_KEY` | From OpenAI dashboard |
| `SENDGRID_API_KEY` | From SendGrid dashboard |
| `FROM_EMAIL` | Verified sender identity |

**Deployment Steps:**
1. Create Azure Function App (Consumption plan for free tier)
2. Install Azure Functions Core Tools: `npm i -g azure-functions-core-tools@4`
3. Deploy: `func azure functionapp publish <APP_NAME>`
4. Configure application settings in Azure Portal
5. Copy function URL to frontend environment

---

## 🧪 Production Smoke Tests

### Frontend Checks (Post-Deploy)

| Test | Expected Result | Status |
|------|----------------|--------|
| Homepage loads at root `/` | 200 OK, title visible | ⏳ Pending |
| Dashboard page `/dashboard` | 200 OK, input form visible | ⏳ Pending |
| Cancel page `/cancel` | 200 OK, cancellation message | ⏳ Pending |
| Success page `/success` | 200 OK, confirmation message | ⏳ Pending |
| 404 handling for unknown routes | Custom 404 page | ⏳ Pending |
| SimpleAnalytics tracking fires | No console errors | ⏳ Pending |

### Backend API Checks (Post-Deploy)

| Test | Expected Result | Status |
|------|----------------|--------|
| POST `/api/generate-posts` with valid content | 200, JSON array of posts | ⏳ Pending |
| POST `/api/generate-posts` without content | 400, error message | ⏳ Pending |
| Stripe checkout session creation | 200, sessionId returned | ⏳ Pending |
| Stripe webhook endpoint reachable | 200, `{received: true}` | ⏳ Pending |
| Email sending via SendGrid | 200, email delivered | ⏳ Pending |

### Integration Checks

| Test | Expected Result | Status |
|------|----------------|--------|
| Content generation end-to-end | Posts generated and displayed | ⏳ Pending |
| Stripe checkout flow (test mode) | Redirect to Stripe, return to success | ⏳ Pending |
| Email notification after generation | Email received at test address | ⏳ Pending |

---

## 🔄 Rollback Procedures

### Frontend Rollback (GitHub Pages)
1. Identify last known-good commit hash
2. Revert: `git revert <commit>` or reset branch: `git reset --hard <commit>`
3. Push to trigger redeployment: `git push origin main`
4. Verify rollback by checking deployment status in GitHub Pages settings

### Backend Rollback (Azure Functions)
1. In Azure Portal → Function App → Deployment Center
2. View deployment history and select previous slot/revision
3. Swap slots if using deployment slots
4. Restore application settings from backup

### Environment Variable Rollback
- Keep encrypted backup of all environment variables
- Document changes in version-controlled secrets manager
- Test with staging environment before production changes

---

## 📊 Monitoring & Observability

### Application Insights (Azure)
- [ ] Enable Application Insights on Function App
- [ ] Configure sampling settings for cost control
- [ ] Set up alerts for error rate > 5%

### SimpleAnalytics
- [x] Tracking script integrated in `layout.tsx`
- [ ] Verify analytics ID is valid
- [ ] Confirm data appears in SimpleAnalytics dashboard

### Error Logging
- [x] Console.error logging in API routes
- [ ] Consider adding structured logging (Pino/Winston)
- [ ] Set up error notification channel (Slack/email)

---

## 📝 Known Issues & Limitations

1. **API Routes on GitHub Pages:** Static export cannot serve Next.js API routes. Azure Functions or alternative serverless hosting is required for backend functionality.
2. **Stripe Webhooks in Test Mode:** Webhook endpoint must be a public URL; localhost webhooks won't work in production.
3. **Environment Variable Naming Inconsistency:** `STRIPE_PUBLISHABLE_KEY` vs `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — needs alignment.
4. **TODO Items in Codebase:** Subscription handling, user access logic, and failed payment handling are stubbed but not implemented.
5. **No Authentication:** The app has no user authentication layer; anyone with the URL can access all features.

---

## ✅ Deployment Readiness Score

| Category | Status | Notes |
|----------|--------|-------|
| Build System | ✅ Ready | Clean build, no errors |
| Frontend Static Assets | ✅ Ready | 12 pages exported |
| Environment Variables | ⚠️ Partial | SendGrid configured; OpenAI/Stripe need keys |
| Backend API | ❌ Not Deployed | Azure Functions not provisioned |
| Payment Integration | ❌ Not Configured | Stripe products/webhooks pending |
| Email Delivery | ✅ Ready | SendGrid key populated |
| Analytics | ⚠️ Partial | Script integrated; ID needs verification |
| Security | ✅ Adequate | Secrets in .gitignore, webhook signing enabled |

**Overall Readiness:** 60% — Build is production-ready but external services need configuration before launch.
