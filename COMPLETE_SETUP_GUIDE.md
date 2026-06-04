# Complete Setup Guide - Content Repurposing Engine

## 🚀 End-to-End Integration Walkthrough

This guide will walk you through every step needed to get your Content Repurposing Engine running from scratch to live deployment.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub Student Developer Pack activated
- [ ] GitHub account
- [ ] OpenAI account (for API key)
- [ ] Stripe account (for payment processing)
- [ ] SendGrid account (for email delivery)
- [ ] Azure account (for $100 credit)
- [ ] Domain name (optional, but recommended)

## 🎯 Phase 1: GitHub Repository Setup (5 minutes)

### Step 1: Create GitHub Repository
1. Go to GitHub.com
2. Click "New repository"
3. Name it "ContentRepurposingEngine"
4. Make it **Public** (required for GitHub Pages)
5. Click "Create repository"

### Step 2: Push Local Code to GitHub
```bash
cd "c:\Codingprojects\passive income\ContentRepurposingEngine"
git init
git add .
git commit -m "Initial commit: Content Repurposing Engine"
git branch -M main
git remote add origin https://github.com/your-username/ContentRepurposingEngine.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll to "Pages" section
4. Under "Source", select "GitHub Actions"
5. Click "Save"

## 🛠️ Phase 2: GitHub Codespaces Setup (10 minutes)

### Step 1: Launch Codespace
1. Go to your repository on GitHub
2. Click "Code" → "Codespaces" → "New codespace"
3. Wait for environment to load (2-3 minutes)

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Verify Development Server
```bash
npm run dev
```
- Open the provided URL in your browser
- You should see the Content Repurposing Engine interface
- Test basic functionality (paste content, generate posts)

## 🔑 Phase 3: API Keys Configuration (15 minutes)

### Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign in/create account
3. Go to "API Keys" → "Create new secret key"
4. Copy the key (starts with `sk-`)

### Step 2: Get Stripe API Keys
1. Go to https://dashboard.stripe.com/
2. Go to "Developers" → "API keys"
3. Copy "Publishable key" (starts with `pk_test_`)
4. Copy "Secret key" (starts with `sk_test_`)
5. Go to "Webhooks" → "Add endpoint"
6. URL: `https://your-domain.com/api/webhooks/stripe`
7. Select events: `customer.subscription.created`, `invoice.payment_succeeded`, `invoice.payment_failed`

### Step 3: Get SendGrid API Key
1. Go to https://sendgrid.com/
2. Create account
3. Go to "Settings" → "API Keys"
4. Create new API key with "Full Access" permissions
5. Copy the key (starts with `SG.`)

### Step 4: Configure Environment Variables
Edit `.env.local` file:
```env
# OpenAI Configuration
OPENAI_API_KEY=sk_your_openai_key_here

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# SendGrid Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# Azure Configuration
AZURE_FUNCTION_URL=https://your-function-app.azurewebsites.net/api

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-simple-analytics-id
```

## 🌐 Phase 4: Frontend Deployment (10 minutes)

### Step 1: Build the Application
```bash
npm run build
```

### Step 2: Verify Build Output
- Check that `out/` directory was created
- Verify all files are properly generated

### Step 3: Commit and Push Changes
```bash
git add .
git commit -m "Add production build"
git push
```

### Step 4: Wait for GitHub Actions
- GitHub Actions will automatically deploy to GitHub Pages
- This usually takes 2-5 minutes
- Your site will be available at: `https://your-username.github.io/ContentRepurposingEngine`

## ☁️ Phase 5: Azure Functions Backend Setup (20 minutes)

### Step 1: Create Azure Account
1. Go to https://azure.microsoft.com/
2. Sign up with your student account
3. Verify your student status
4. You'll get $100 credit

### Step 2: Create Function App
1. Go to Azure Portal
2. Click "Create resource"
3. Search for "Function App"
4. Configure:
   - Name: `ContentRepurposingEngine-API`
   - Runtime stack: "Node.js"
   - Version: "18 LTS"
   - Region: Choose closest to your users
   - Operating system: "Linux"
   - Plan: "Consumption (Serverless)"
5. Click "Review + create" → "Create"

### Step 3: Deploy Azure Functions
1. In your local terminal:
```bash
cd AZURE_FUNCTIONS_API
npm install
```

2. Create deployment package:
```bash
zip -r ../azure-functions.zip .
```

3. Deploy to Azure:
```bash
az functionapp deployment source config-zip \
  --name ContentRepurposingEngine-API \
  --resource-group your-resource-group \
  --src azure-functions.zip
```

### Step 4: Configure Azure Environment Variables
1. Go to Azure Portal
2. Navigate to your Function App
3. Go to "Configuration" → "Application settings"
4. Add these settings:
   ```
   OPENAI_API_KEY=your_openai_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   SENDGRID_API_KEY=your_sendgrid_key
   FROM_EMAIL=noreply@yourdomain.com
   ```

### Step 5: Configure CORS
1. In Azure Portal, go to "Function App"
2. Go to "Platform features" → "API"
3. Under "CORS", add:
   - Allowed origins: `https://your-username.github.io`
   - Allowed methods: `GET, POST, OPTIONS`
   - Allowed headers: `*`

## 💳 Phase 6: Stripe Configuration (15 minutes)

### Step 1: Create Products in Stripe
1. Go to Stripe Dashboard → "Products"
2. Create three products:
   - **Basic Plan**: $9.99/month
   - **Pro Plan**: $19.99/month
   - **Agency Plan**: $49.99/month

### Step 2: Configure Price IDs
Update `src/components/StripeCheckout.tsx` with your actual price IDs:
```javascript
const PRICES = {
  BASIC: 'price_1YourBasicPriceId',
  PRO: 'price_1YourProPriceId',
  AGENCY: 'price_1YourAgencyPriceId'
}
```

### Step 3: Test Stripe Integration
1. Use Stripe's test mode
2. Test checkout flow with test card: `4242 4242 4242 4242`
3. Verify webhook events are received

## 📧 Phase 7: Email Configuration (10 minutes)

### Step 1: Verify SendDomain
1. Go to SendGrid → "Settings" → "Sender Authentication"
2. Add your domain and verify it
3. Create a sender email address (e.g., `noreply@yourdomain.com`)

### Step 2: Test Email Delivery
1. Use the test endpoint in Azure Functions
2. Send a test email to verify it works
3. Check spam/junk folders

## 📊 Phase 8: Analytics Setup (5 minutes)

### Step 1: Create SimpleAnalytics Account
1. Go to https://simpleanalytics.com/
2. Sign up with free account
3. Add your website
4. Get your analytics ID

### Step 2: Update Analytics ID
Edit `NEXT_PUBLIC_ANALYTICS_ID.txt` with your actual ID.

## 🔧 Phase 9: Domain Configuration (Optional, 10 minutes)

### Step 1: Configure DNS
1. Go to your domain registrar (Name.com, Namecheap, etc.)
2. Add DNS records:
   - A record: `@` → GitHub Pages IP
   - CNAME record: `www` → `your-username.github.io`

### Step 2: Configure Custom Domain in GitHub Pages
1. Go to repository settings → Pages
2. Under "Custom domain", enter your domain
3. Enable "Enforce HTTPS"

## 🧪 Phase 10: Testing and Validation (30 minutes)

### Step 1: End-to-End Testing
1. **Frontend Test**: Visit your live site
2. **Content Generation**: Paste blog content and generate posts
3. **Payment Test**: Use Stripe test card to purchase subscription
4. **Email Test**: Verify email delivery
5. **Analytics Test**: Check SimpleAnalytics dashboard

### Step 2: API Testing
```bash
# Test content generation
curl -X POST https://your-function-app.azurewebsites.net/api \
  -H "Content-Type: application/json" \
  -d '{"content":"Your blog content here"}'

# Test webhook endpoint
curl -X POST https://your-domain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: your-test-signature" \
  -d '{"test": true}'
```

### Step 3: Performance Testing
- Check page load speed
- Test mobile responsiveness
- Verify API response times
- Check error handling

## 🎯 Phase 11: Launch Preparation (15 minutes)

### Step 1: Final Configuration Review
- [ ] All API keys are properly configured
- [ ] Environment variables are set correctly
- [ ] DNS records are pointing correctly
- [ ] SSL certificates are active
- [ ] All features are working as expected

### Step 2: Documentation Review
- [ ] README.md is up to date
- [ ] All links are working
- [ ] Contact information is correct
- [ ] Privacy policy and terms of service are ready

### Step 3: Marketing Materials
- [ ] Social media posts prepared
- [ ] Email campaign ready
- [ ] Landing page copy ready
- [ ] Support documentation ready

## 🚀 Phase 12: Launch Day!

### Step 1: Final Checks
- [ ] All systems are operational
- [ ] Payment processing is working
- [ ] Email delivery is working
- [ ] Analytics are tracking correctly

### Step 2: Go Live
1. Switch Stripe to live mode
2. Update any hardcoded test data
3. Announce launch to your network
4. Monitor systems closely

### Step 3: Post-Launch Monitoring
- [ ] Check Stripe dashboard for payments
- [ ] Monitor SimpleAnalytics for traffic
- [ ] Respond to user feedback
- [ ] Address any issues immediately

## 📈 Phase 13: Ongoing Maintenance

### Daily Tasks
- [ ] Monitor application health
- [ ] Check Stripe payments
- [ ] Review analytics data
- [ ] Respond to support requests

### Weekly Tasks
- [ ] Update dependencies
- [ ] Review user feedback
- [ ] Analyze usage patterns
- [ ] Plan improvements

### Monthly Tasks
- [ ] Review performance metrics
- [ ] Update pricing strategy
- [ ] Plan marketing campaigns
- [ ] Review and update documentation

## 🎉 Congratulations!

You now have a fully functional, automated Micro-SaaS application that can generate passive income. The Content Repurposing Engine is ready to start serving customers and generating revenue.

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section in the documentation
2. Review the GitHub Issues page
3. Contact support for your services (OpenAI, Stripe, SendGrid, Azure)

## 🔄 Next Steps

Once you're comfortable with this first application, you can implement the remaining two Micro-SaaS ideas using the same patterns and infrastructure.