# Setup Checklist - Content Repurposing Engine

## Quick Setup (Under 10 minutes)

### Step 1: GitHub Repository Setup
- [ ] Create new GitHub repository named "ContentRepurposingEngine"
- [ ] Push the code to GitHub
- [ ] Enable GitHub Pages in repository settings

### Step 2: GitHub Codespaces Setup
- [ ] Open repository in GitHub
- [ ] Click "Code" → "Codespaces" → "New codespace"
- [ ] Wait for environment to load (2-3 minutes)
- [ ] Install dependencies: `npm install`
- [ ] Run development server: `npm run dev`

### Step 3: Environment Configuration
- [ ] Get OpenAI API key from https://platform.openai.com/
- [ ] Get Stripe API keys from https://dashboard.stripe.com/
- [ ] Get SendGrid API key from https://sendgrid.com/
- [ ] Update `.env.local` with all API keys

### Step 4: Frontend Deployment
- [ ] Build the application: `npm run build`
- [ ] Go to repository settings → Pages
- [ ] Select "GitHub Actions" as source
- [ ] Commit and push changes

### Step 5: Backend Setup (Azure Functions)
- [ ] Create Azure account (use $100 credit)
- [ ] Create Function App
- [ ] Deploy backend code from `AZURE_FUNCTIONS_API` folder
- [ ] Configure environment variables in Azure

### Step 6: Stripe Configuration
- [ ] Create products and price IDs in Stripe dashboard
- [ ] Update `StripeCheckout.tsx` with price IDs
- [ ] Configure webhook endpoint
- [ ] Test checkout flow

### Step 7: Analytics Setup
- [ ] Create SimpleAnalytics account
- [ ] Get analytics ID
- [ ] Update `NEXT_PUBLIC_ANALYTICS_ID.txt`

## Testing Checklist

### Frontend Testing
- [ ] Development server runs without errors
- [ ] Content input works
- [ ] Social posts generation works
- [ ] Copy to clipboard functionality works
- [ ] Pricing page displays correctly

### Backend Testing
- [ ] Azure Function deploys successfully
- [ ] API endpoints respond correctly
- [ ] OpenAI integration works
- [ ] Email delivery works (if configured)

### Payment Testing
- [ ] Stripe checkout button works
- [ ] Webhook events are received
- [ ] Success/cancel pages display correctly

## Deployment Checklist

### GitHub Pages
- [ ] Repository is public (required for GitHub Pages)
- [ ] GitHub Actions workflow is enabled
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (GitHub Pages provides HTTPS)

### Azure Functions
- [ ] Function App is running
- [ ] Environment variables are set
- [ ] CORS is configured for frontend access
- [ ] Function is accessible from the internet

### Domain Configuration
- [ ] DNS records are configured
- [ ] SSL certificate is active
- [ ] Domain points to correct hosting

## Post-Deployment Checklist

### Monitoring
- [ ] SimpleAnalytics is tracking traffic
- [ ] Stripe dashboard is monitoring payments
- [ ] Error logs are being monitored
- [ ] Performance is being tracked

### Security
- [ ] API keys are not exposed in frontend code
- [ ] Environment variables are properly secured
- [ ] CORS policies are restrictive
- [ ] Input validation is implemented

## Troubleshooting

### Common Issues
1. **Build errors**: Check Node.js version and dependencies
2. **Stripe integration**: Verify API keys and webhook configuration
3. **AI processing**: Check OpenAI API limits and billing
4. **Email delivery**: Verify SendGrid configuration and limits
5. **CORS issues**: Check Azure Function CORS settings

### Support Resources
- GitHub Issues: https://github.com/your-repo/issues
- Stripe Documentation: https://stripe.com/docs
- Azure Documentation: https://docs.microsoft.com/azure
- OpenAI Documentation: https://platform.openai.com/docs

## Next Steps

### Phase 1: Launch
- [ ] Deploy the application
- [ ] Test all functionality
- [ ] Monitor initial usage
- [ ] Collect user feedback

### Phase 2: Optimization
- [ ] Analyze user behavior
- [ ] Optimize AI prompts
- [ ] Improve user interface
- [ ] Add additional features

### Phase 3: Scaling
- [ ] Monitor performance
- [ ] Scale resources as needed
- [ ] Add advanced features
- [ ] Consider premium offerings