# Production Smoke Test Plan — Content Repurposing Engine v1.0.0

**Purpose:** Verify production deployment is functional before announcing release.
**Prerequisites:** All environment variables configured, frontend deployed to GitHub Pages, backend deployed to Azure Functions.

---

## 🔍 Phase 1: Frontend Static Page Checks

### Test 1.1 — Homepage Loads
- **URL:** `https://<github-user>.github.io/ContentRepurposingEngine/`
- **Method:** GET request or browser navigation
- **Expected:** HTTP 200, page title "Content Repurposing Engine | Dashboard", no console errors
- **Pass Criteria:** Page renders within 3s, all CSS loaded

### Test 1.2 — Dashboard Page Loads
- **URL:** `/dashboard/`
- **Method:** Browser navigation from homepage or direct URL
- **Expected:** HTTP 200, content input textarea visible, "Generate Posts" button present
- **Pass Criteria:** Form elements render correctly on desktop and mobile viewports

### Test 1.3 — Success Page Loads
- **URL:** `/success/`
- **Method:** Direct navigation (normally reached after Stripe checkout)
- **Expected:** HTTP 200, confirmation message visible
- **Pass Criteria:** Page displays success state without errors

### Test 1.4 — Cancel Page Loads
- **URL:** `/cancel/`
- **Method:** Direct navigation (normally reached after Stripe checkout cancellation)
- **Expected:** HTTP 200, cancellation message and CTA buttons visible
- **Pass Criteria:** Page displays cancel state with navigation options

### Test 1.5 — 404 Handling
- **URL:** `/nonexistent-route/`
- **Method:** Direct navigation to unknown path
- **Expected:** Custom 404 page (not browser default)
- **Pass Criteria:** Branded error page with navigation back to home

### Test 1.6 — SimpleAnalytics Integration
- **Method:** Open browser DevTools → Network tab, navigate to any page
- **Expected:** Request to `cloud.simpleanalyticscdn.com` or analytics endpoint
- **Pass Criteria:** No console errors related to analytics; tracking fires silently

---

## 🔌 Phase 2: Backend API Checks

### Test 2.1 — Content Generation Endpoint
- **URL:** `https://<function-app>.azurewebsites.net/api/` (or Next.js `/api/generate-posts`)
- **Method:** POST with JSON body `{ "content": "Test blog post about AI" }`
- **Expected:** HTTP 200, JSON response with `success: true` and `posts` array
- **Pass Criteria:** Response contains ≥1 generated post within 30s timeout

### Test 2.2 — Content Generation Error Handling
- **URL:** Same as 2.1
- **Method:** POST with empty body `{}` or missing `content` field
- **Expected:** HTTP 400, JSON response with error message
- **Pass Criteria:** Graceful error without stack trace exposure

### Test 2.3 — Stripe Checkout Session Creation
- **URL:** `/api/create-checkout-session/` (or Azure equivalent)
- **Method:** POST with `{ "priceId": "<stripe_price_id>" }`
- **Expected:** HTTP 200, JSON response with `sessionId` string
- **Pass Criteria:** Valid Stripe session ID returned; no secret key exposure

### Test 2.4 — Stripe Webhook Endpoint Reachability
- **URL:** `/api/webhooks/stripe/` (or Azure equivalent)
- **Method:** POST via Stripe CLI: `stripe trigger payment_intent.succeeded`
- **Expected:** HTTP 200, `{ "received": true }`
- **Pass Criteria:** Webhook signature verified; event processed without error

### Test 2.5 — Email Delivery
- **URL:** `/api/send-email/` (or via content generation with email field)
- **Method:** POST with `{ "email": "test@example.com", "posts": ["Test post"] }`
- **Expected:** HTTP 200, email delivered to test inbox within 60s
- **Pass Criteria:** Email received with correct sender, subject, and content

### Test 2.6 — Usage Tracking
- **URL:** `/api/track-usage/`
- **Method:** POST with usage data; then GET to retrieve
- **Expected:** POST returns 200; GET returns tracked usage data
- **Pass Criteria:** Data persisted and retrievable

---

## 🔗 Phase 3: Integration Checks

### Test 3.1 — End-to-End Content Generation
1. Navigate to `/dashboard/`
2. Paste sample blog content (≥100 words)
3. Click "Generate Posts"
4. **Expected:** Generated posts appear in UI within 30s
5. **Pass Criteria:** All 4 platform-specific posts displayed with copy buttons

### Test 3.2 — Stripe Checkout Flow (Test Mode)
1. Navigate to pricing section on dashboard
2. Select a plan and click "Subscribe"
3. **Expected:** Redirect to Stripe hosted checkout page
4. Complete test payment (card: `4242 4242 4242 4242`)
5. **Expected:** Redirect to `/success/` after payment
6. **Pass Criteria:** Full flow completes without errors; webhook fires

### Test 3.3 — Email Notification After Generation
1. Generate content with email address in the form
2. **Expected:** Posts generated AND email sent
3. Check inbox for delivery within 60s
4. **Pass Criteria:** Both generation and email succeed independently

---

## 📊 Phase 4: Performance & Security Checks

### Test 4.1 — Page Load Performance
- **Tool:** Lighthouse or WebPageTest
- **Expected:** First Contentful Paint < 2s on 4G connection
- **Pass Criteria:** Lighthouse performance score ≥ 70

### Test 4.2 — No Secrets in Client Bundle
- **Method:** Search `.next-out/` JavaScript bundles for `sk_`, `SG.`, or API key patterns
- **Expected:** Zero matches for secret patterns
- **Pass Criteria:** Only publishable keys (`pk_`) appear in client code

### Test 4.3 — HTTPS Enforcement
- **Method:** Access site via `http://` and verify redirect to `https://`
- **Expected:** Automatic redirect with 301 status
- **Pass Criteria:** All traffic served over TLS

---

## ✅ Smoke Test Results Template

| Phase | Test ID | Description | Result | Notes |
|-------|---------|------------|--------|-------|
| 1 | 1.1 | Homepage loads | ⬜ Pass / ⬜ Fail | |
| 1 | 1.2 | Dashboard page loads | ⬜ Pass / ⬜ Fail | |
| 1 | 1.3 | Success page loads | ⬜ Pass / ⬜ Fail | |
| 1 | 1.4 | Cancel page loads | ⬜ Pass / ⬜ Fail | |
| 1 | 1.5 | 404 handling | ⬜ Pass / ⬜ Fail | |
| 1 | 1.6 | Analytics integration | ⬜ Pass / ⬜ Fail | |
| 2 | 2.1 | Content generation API | ⬜ Pass / ⬜ Fail | |
| 2 | 2.2 | Error handling | ⬜ Pass / ⬜ Fail | |
| 2 | 2.3 | Stripe checkout session | ⬜ Pass / ⬜ Fail | |
| 2 | 2.4 | Webhook endpoint | ⬜ Pass / ⬜ Fail | |
| 2 | 2.5 | Email delivery | ⬜ Pass / ⬜ Fail | |
| 2 | 2.6 | Usage tracking | ⬜ Pass / ⬜ Fail | |
| 3 | 3.1 | E2E content generation | ⬜ Pass / ⬜ Fail | |
| 3 | 3.2 | Stripe checkout flow | ⬜ Pass / ⬜ Fail | |
| 3 | 3.3 | Email notification | ⬜ Pass / ⬜ Fail | |
| 4 | 4.1 | Performance | ⬜ Pass / ⬜ Fail | |
| 4 | 4.2 | No secrets in bundle | ⬜ Pass / ⬜ Fail | |
| 4 | 4.3 | HTTPS enforcement | ⬜ Pass / ⬜ Fail | |

**Overall Result:** ⬜ PASS (all tests pass) / ⬜ FAIL (any test fails — block release)

---

## 🚦 Go/No-Go Decision Criteria

### Release Approved If:
- All Phase 1 (frontend) tests pass
- At least 4 of 6 Phase 2 (backend) tests pass
- Test 3.1 (E2E content generation) passes
- No secrets exposed in client bundles (Test 4.2)

### Release Blocked If:
- Any frontend page fails to load
- Content generation API returns 5xx errors
- Secrets found in client-side JavaScript
- Stripe webhook verification fails consistently
