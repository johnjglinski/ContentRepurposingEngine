# GitHub Secrets Configuration Template

Add these secrets in your GitHub repository settings → Settings → Secrets and variables → Actions.

## Required Secrets for CI/CD

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `NEXT_PUBLIC_APP_URL` | Production app URL | `https://your-domain.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (test or live) | `pk_test_...` or `pk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` |
| `STRIPE_BASIC_PRICE_ID` | Basic plan price ID ($9.99/mo) | `price_1OaBcD...` |
| `STRIPE_PRO_PRICE_ID` | Pro plan price ID ($19.99/mo) | `price_1OeFgH...` |
| `STRIPE_AGENCY_PRICE_ID` | Agency plan price ID ($49.99/mo) | `price_1OiJkL...` |
| `SENDGRID_API_KEY` | SendGrid email API key | `SG....` |
| `FROM_EMAIL` | Sender email address | `noreply@yourdomain.com` |

## Setup Steps

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret" for each entry above
3. Paste the corresponding value from your Stripe/OpenAI/SendGrid dashboards
4. Commit any code changes — the workflow will use these secrets automatically

## ⚠️ Security Notes

- **Never** commit secret values to the repository
- Use test keys (`sk_test_`, `pk_test_`) for development/staging branches
- Use live keys only on the `main` branch after production deployment is ready
- Rotate keys periodically and update GitHub secrets accordingly
- The `.gitignore` file excludes `.env*.local` — verify it's still in place
