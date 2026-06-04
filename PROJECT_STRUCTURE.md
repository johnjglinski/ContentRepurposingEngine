# Project Structure - Content Repurposing Engine

```
ContentRepurposingEngine/
├── README.md                    # Main project documentation
├── QUICK_START_GUIDE.md         # 5-minute setup guide
├── DEPLOYMENT_GUIDE.md         # Multi-cloud deployment instructions
├── SETUP_CHECKLIST.md          # Comprehensive setup checklist
├── PROJECT_STRUCTURE.md        # This file - project structure overview
├── STRIPE_CHECKOUT_BUTTON.md   # Stripe integration guide
├── LAUNCH_SCRIPT.sh            # Unix/Mac launch script
├── LAUNCH_SCRIPT.bat           # Windows launch script
├── NEXT_PUBLIC_ANALYTICS_ID.txt # SimpleAnalytics ID placeholder
├── package.json                # Project dependencies and scripts
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── .env.local                 # Environment variables (template)
├── .github/workflows/         # GitHub Actions for deployment
│   └── deploy.yml             # Deploy to GitHub Pages
├── AZURE_FUNCTIONS_API/       # Azure Functions backend
│   ├── index.js              # Main function logic
│   ├── function.json         # Function configuration
│   ├── host.json             # Azure Functions host configuration
│   └── package.json          # Backend dependencies
└── src/                       # Frontend source code
    ├── app/                  # Next.js app directory
    │   ├── globals.css       # Global styles
    │   ├── layout.tsx        # Root layout component
    │   ├── page.tsx          # Home page
    │   ├── api/              # API routes
    │   │   ├── generate-posts/route.ts      # Content generation API
    │   │   ├── create-checkout-session/route.ts # Stripe checkout
    │   │   └── webhooks/stripe/route.ts     # Stripe webhooks
    │   ├── success/          # Success page
    │   │   └── page.tsx      # Payment success page
    │   ├── cancel/           # Cancel page
    │   │   └── page.tsx      # Payment cancel page
    │   └── SimpleAnalytics.tsx # Analytics component
    ├── components/           # React components
    │   ├── ui/              # UI components
    │   │   ├── card.tsx     # Card component
    │   │   ├── button.tsx   # Button component
    │   │   ├── input.tsx    # Input component
    │   │   ├── textarea.tsx # Textarea component
    │   │   └── badge.tsx    # Badge component
    │   └── StripeCheckout.tsx # Stripe checkout component
    └── lib/                 # Utility functions
        └── utils.ts         # Utility functions
```

## Key Components

### Frontend (Next.js)
- **Home Page** (`src/app/page.tsx`): Main application interface
- **Layout** (`src/app/layout.tsx`): Root layout with analytics
- **API Routes** (`src/app/api/`): Backend API endpoints
- **UI Components** (`src/components/ui/`): Reusable UI components
- **Stripe Checkout** (`src/components/StripeCheckout.tsx`): Payment interface

### Backend (Azure Functions)
- **Main Function** (`AZURE_FUNCTIONS_API/index.js`): AI content processing
- **Configuration** (`AZURE_FUNCTIONS_API/function.json`): Function settings
- **Host Configuration** (`AZURE_FUNCTIONS_API/host.json`): Azure settings

### Configuration
- **Environment Variables** (`.env.local`): API keys and secrets
- **Next.js Config** (`next.config.js`): Build configuration
- **Tailwind Config** (`tailwind.config.js`): Styling configuration

### Deployment
- **GitHub Actions** (`.github/workflows/deploy.yml`): Automated deployment
- **Documentation**: Comprehensive setup and deployment guides

## File Purpose

### Core Application Files
- `src/app/page.tsx`: Main application interface with content input and social post generation
- `src/components/StripeCheckout.tsx`: Payment interface with subscription plans
- `src/app/api/generate-posts/route.ts`: API endpoint for content generation
- `AZURE_FUNCTIONS_API/index.js`: Serverless function for AI processing

### Configuration Files
- `package.json`: Project dependencies and scripts
- `next.config.js`: Next.js configuration for static export
- `tailwind.config.js`: Tailwind CSS configuration
- `.env.local`: Environment variables (API keys)

### Documentation Files
- `README.md`: Main project documentation
- `QUICK_START_GUIDE.md`: 5-minute setup guide
- `DEPLOYMENT_GUIDE.md`: Multi-cloud deployment instructions
- `SETUP_CHECKLIST.md`: Comprehensive setup checklist
- `STRIPE_CHECKOUT_BUTTON.md`: Stripe integration guide

### Deployment Files
- `.github/workflows/deploy.yml`: GitHub Actions for automated deployment
- `LAUNCH_SCRIPT.sh`/`.bat`: Quick launch scripts for development

## Development Workflow

1. **Setup**: Use `LAUNCH_SCRIPT.sh` or `LAUNCH_SCRIPT.bat` for quick setup
2. **Development**: Run `npm run dev` to start development server
3. **Build**: Run `npm run build` to create production build
4. **Deploy**: Push to GitHub to trigger automatic deployment

## Key Features

- **AI-Powered Content Transformation**: Uses OpenAI GPT-4 to generate social media posts
- **Automated Billing**: Stripe integration with subscription management
- **Analytics**: SimpleAnalytics for traffic monitoring
- **Multi-Cloud Deployment**: GitHub Pages + Azure Functions
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Zero Operational Time**: Fully automated once deployed

## Scalability

The project is designed to scale within free tiers:
- **Frontend**: GitHub Pages (free)
- **Backend**: Azure Functions (free tier with $100 credit)
- **Analytics**: SimpleAnalytics (100k views free)
- **Payments**: Stripe (first $1,000 fee-free)

This structure allows for rapid development and deployment while maintaining scalability and maintainability.