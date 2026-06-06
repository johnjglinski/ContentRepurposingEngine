# Resume Scanner SaaS (ResumeScore)

Emergency income system #2: AI-powered ATS resume scoring tool with freemium model.

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # then fill in your Stripe + AI keys
npm run dev    # runs on port 3002
npm run build
npm start      # production server on port 3002
```

## Setup Checklist

### 1. Configure Stripe Products
Create these products in your Stripe Dashboard:
- "Single Resume Scan" - $3 one-time payment
- "Unlimited Monthly Plan" - $9/month subscription

Copy the Price IDs into `.env.local`.

### 2. Configure AI API
Choose one:
- **LM Studio (free)**: Run LM Studio locally, set `LM_STUDIO_URL=http://localhost:1234/v1`
- **OpenAI**: Set `OPENAI_API_KEY=sk-your-key-here`
- Without either, the system falls back to mock analysis (good for testing)

### 3. Configure Email (Optional)
Set SendGrid API key in `.env.local` for purchase confirmation emails.

## How It Works

1. User uploads resume (PDF/TXT) + pastes job description
2. Free tier: Shows overall ATS score + top 3 keyword gaps
3. Paid tier ($3 scan or $9/mo): Unlocks section scores, personalized tips, and AI-optimized resume version
4. Payment processed via Stripe checkout

## Deployment

```bash
npm run build:clean
# Deploy .next-out/ to your hosting provider
```

For DigitalOcean droplet deployment alongside CRE + Store, see the main DEPLOYMENT_GUIDE.md.

## Weekly Maintenance (~1 hour)
- Check Stripe dashboard / refund requests (5 min daily)
- Monitor AI API costs / usage limits (10 min weekly)
- Review error logs for upload failures (10 min weekly)
- Update prompt engineering based on feedback (15 min bi-weekly)
