# Content Repurposing Engine

AI-powered blog post to social media content converter that transforms long-form content into multiple optimized social media posts automatically.

## Features

- 🤖 AI-powered content transformation
- 📱 Optimized for multiple social media platforms
- ⚡ One-click generation
- 📋 Easy copy-to-clipboard functionality
- 💰 Automated billing with Stripe integration
- 📊 Analytics with SimpleAnalytics

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Azure Functions (free tier)
- **AI**: OpenAI GPT-4
- **Payments**: Stripe
- **Email**: SendGrid
- **Analytics**: SimpleAnalytics
- **Hosting**: GitHub Pages (frontend), Azure (backend)

## Getting Started

### Prerequisites

- GitHub Student Developer Pack
- OpenAI API key
- Stripe account
- SendGrid account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Frontend (GitHub Pages)

1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy to GitHub Pages

### Backend (Azure Functions)

1. Create Azure Function App
2. Deploy the backend code
3. Configure environment variables

## Usage

1. Paste your blog content into the textarea
2. Click "Generate Social Posts"
3. Copy the generated posts to your clipboard
4. Post directly to your social media platforms

## Pricing

- **Basic**: $9.99/month for unlimited posts
- **Pro**: $19.99/month with advanced features
- **Agency**: $49.99/month with team collaboration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For support, please open an issue in the GitHub repository.