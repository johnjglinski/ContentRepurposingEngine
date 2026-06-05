# Content Repurposing Engine

AI-powered blog post to social media content converter that transforms long-form content into multiple optimized social media posts automatically using local AI models via LM Studio.

## Features

- 🤖 **AI-Powered Content Transformation** - Uses LM Studio for local, private AI processing
- 📱 **Multi-Platform Optimization** - Generates posts for Twitter, LinkedIn, Facebook, and Instagram
- ⚡ **One-Click Generation** - Transform blog content in seconds
- 📋 **Easy Copy-to-Clipboard** - Instantly copy generated posts
- 💰 **Stripe Integration** - Automated billing with multiple pricing tiers
- 📊 **Analytics** - Built-in SimpleAnalytics integration
- 🔒 **Privacy-First** - Process content locally with LM Studio (no data leaves your machine)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **AI Engine** | LM Studio (OpenAI-compatible local API) |
| **Backend Functions** | Appwrite Cloud Functions |
| **Payments** | Stripe |
| **Email** | SendGrid |
| **Analytics** | SimpleAnalytics |
| **Hosting** | GitHub Pages (frontend), Appwrite/Azure (backend) |

## Prerequisites

- Node.js 18+ and npm
- [LM Studio](https://lmstudio.ai/) installed and running locally
- Git for version control
- (Optional) Stripe account for payment processing
- (Optional) SendGrid account for email notifications

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/ContentRepurposingEngine.git
cd ContentRepurposingEngine
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The `.env.local` file is already configured with default values. Update the following:

**Required for local development:**
- `LM_STUDIO_URL` - Default: `http://localhost:1234/v1` (ensure LM Studio is running)
- `LM_STUDIO_MODEL` - Default: `local-model` (change to match your loaded model in LM Studio)

**Optional (for full functionality):**
- Stripe keys and price IDs for payment processing
- SendGrid credentials for email notifications
- Appwrite project ID for cloud functions

### 4. Start LM Studio

1. Open LM Studio
2. Load a compatible model (e.g., Llama 3, Mistral)
3. Start the local server (default port: 1234)
4. Note your model name for `LM_STUDIO_MODEL` in `.env.local`

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
ContentRepurposingEngine/
├── app/                    # Next.js API routes
│   └── api/               # Server-side API endpoints
├── src/                   # Source code
│   ├── app/              # App router pages and layouts
│   ├── components/       # React components
│   └── lib/              # Utility libraries (Appwrite client)
├── APPWRITE_FUNCTIONS/    # Cloud function definitions
│   ├── generate-posts/   # AI content generation function
│   ├── send-email/       # Email notification function
│   └── webhooks-stripe/  # Stripe webhook handler
├── AZURE_FUNCTIONS_API/  # Azure Functions (legacy/alternative backend)
├── .env.example          # Environment variable template
├── .env.local            # Local environment config (git-ignored)
└── next.config.js        # Next.js configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

See `.env.example` for a complete list of supported environment variables.

### LM Studio Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LM_STUDIO_URL` | `http://localhost:1234/v1` | LM Studio API endpoint |
| `LM_STUDIO_MODEL` | `local-model` | Model name to use for generation |

### Stripe Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_BASIC_PRICE_ID` | Price ID for Basic plan |
| `STRIPE_PRO_PRICE_ID` | Price ID for Pro plan |
| `STRIPE_AGENCY_PRICE_ID` | Price ID for Agency plan |

## Deployment

### Frontend (GitHub Pages)

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to GitHub Pages on pushes to the `main` branch.

To enable:
1. Push code to your GitHub repository
2. Go to Settings → Pages → Set "Source" to "GitHub Actions"
3. The workflow will deploy automatically on push

### Backend (Appwrite Functions)

1. Deploy Appwrite functions using the scripts in `APPWRITE_FUNCTIONS/`
2. Configure environment variables in your Appwrite project dashboard
3. Update `NEXT_PUBLIC_APPWRITE_PROJECT_ID` in `.env.local`

## Usage

1. Paste your blog content into the textarea on the homepage
2. Click "Generate Social Posts"
3. Review and edit the generated posts if needed
4. Copy individual posts to your clipboard
5. Publish directly to your social media platforms

## Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| **Basic** | $9.99/month | Unlimited post generation |
| **Pro** | $19.99/month | Advanced features and priority processing |
| **Agency** | $49.99/month | Team collaboration and bulk operations |

## Troubleshooting

### LM Studio Connection Issues

- Ensure LM Studio is running and the local server is active
- Verify `LM_STUDIO_URL` matches your LM Studio port (default: 1234)
- Check that a model is loaded in LM Studio before generating posts

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Clear the `.next-out` directory and rebuild: `rm -rf .next-out && npm run build`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

## Support

For support, please open an issue in the GitHub repository or contact the development team.
