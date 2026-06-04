# Quick Start Guide - Content Repurposing Engine

## 5-Minute Setup

### 1. Launch GitHub Codespaces
1. Go to your GitHub repository
2. Click "Code" → "Codespaces" → "New codespace"
3. Wait for environment to load (2-3 minutes)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Edit `.env.local` and add:
```
OPENAI_API_KEY=your_openai_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
SENDGRID_API_KEY=your_sendgrid_key
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Test the Application
- Open the provided URL in your browser
- Paste sample blog content
- Click "Generate Social Posts"
- Copy generated posts to clipboard

## Deployment Steps

### Frontend (GitHub Pages)
1. Build the application:
   ```bash
   npm run build
   ```
2. Go to repository settings → Pages
3. Select "GitHub Actions" as source
4. Commit and push changes

### Backend (Azure Functions)
1. Create Azure Function App
2. Deploy code from `AZURE_FUNCTIONS_API` folder
3. Configure environment variables

## Usage Instructions

### For Users
1. Paste blog content into the textarea
2. Click "Generate Social Posts"
3. Copy posts to clipboard
4. Post directly to social media platforms

### For Content Creators
1. Choose your subscription plan
2. Get unlimited post generation
3. Receive email with formatted posts
4. Access advanced AI optimization

## Key Features

- ✨ AI-powered content transformation
- 📱 Optimized for multiple platforms
- ⚡ One-click generation
- 📋 Easy copy functionality
- 💰 Automated billing
- 📊 Usage analytics

## Support

- Documentation: `/README.md`
- Deployment Guide: `/DEPLOYMENT_GUIDE.md`
- Stripe Integration: `/STRIPE_CHECKOUT_BUTTON.md`
- Setup Checklist: `/SETUP_CHECKLIST.md`

## Next Steps

1. Test the application thoroughly
2. Deploy to production
3. Monitor analytics
4. Collect user feedback
5. Iterate and improve

## Time Estimate

- Setup: 5-10 minutes
- Testing: 15-20 minutes
- Deployment: 10-15 minutes
- Total: 30-45 minutes

You'll have a fully functional Micro-SaaS application ready to generate revenue!