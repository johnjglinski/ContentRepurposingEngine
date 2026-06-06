# Digital Product Store (PromptShop)

Emergency income system #1: Sell AI prompt templates and productivity checklists as digital downloads.

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # then fill in your Stripe keys
npm run dev    # runs on port 3001
npm run build
npm start      # production server on port 3001
```

## Setup Checklist

### 1. Configure Stripe Products (One-Time Payments)
Create these products in your Stripe Dashboard:
- "30 AI Prompts for Social Media Managers" - $7 one-time
- "Content Calendar Template" - $9 one-time  
- "Freelancer Rate Calculator + Contract Template" - $12 one-time
- "Side Hustle Idea Generator (50 Prompts)" - $7 one-time
- "Resume Builder Prompt Pack" - $9 one-time

Copy the Price IDs into `.env.local`.

### 2. Create Actual Product Files
Replace placeholder files in `public/products/` with real PDFs/ZIPs:
- `social-media-prompts.pdf`
- `content-calendar-template.zip`
- `freelancer-rate-calculator.zip`
- `side-hustle-prompts.pdf`
- `resume-builder-pack.pdf`

### 3. Configure Email (Optional)
Set SendGrid API key in `.env.local` for automated purchase confirmation emails.

## Deployment

```bash
npm run build:clean
# Deploy .next-out/ to your hosting provider
# Or deploy to Vercel/GitHub Pages
```

For DigitalOcean droplet deployment alongside CRE, see the main DEPLOYMENT_GUIDE.md.

## Weekly Maintenance (~30 min)
- Check Stripe dashboard for payments/refunds (5 min daily)
- Add 1 new product per week (20 min)
- Reply to customer emails (5 min as needed)
