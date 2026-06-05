# Content Repurposing Engine - Azure Functions Backend

## Overview

Azure Functions backend for the Content Repurposing Engine Micro-SaaS. Provides AI-powered social media post generation using **LM Studio** (local AI processing) and email delivery via **SendGrid**.

## API Endpoints

### POST `/api/generate-posts`

Generate 4 platform-optimized social media posts from blog content.

**Request Body:**
```json
{
  "content": "Your blog post content here...",
  "email": "optional@email.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "posts": [
    "Twitter-optimized post with hashtags...",
    "LinkedIn professional post...",
    "Facebook engaging post...",
    "Instagram visual-focused post..."
  ],
  "emailSent": false,
  "timestamp": "2026-06-05T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Missing or invalid content field
- `500` - Internal server error (configuration errors)
- `503` - AI service (LM Studio) not available

## Quick Start

### Prerequisites
1. Node.js 20+ installed
2. Azure account with active subscription
3. **LM Studio** installed and running locally (or accessible via network)
4. SendGrid account with valid credentials

### LM Studio Setup
1. Download and install LM Studio from [https://lmstudio.ai](https://lmstudio.ai)
2. Load your preferred model (e.g., Mistral, Llama, etc.)
3. Start the local server (default: `http://localhost:1234`)
4. Note the model name for configuration

### Local Development
```bash
# Install dependencies
npm install

# Copy and configure local settings
copy local.settings.json.example local.settings.json
# Edit local.settings.json to add your LM Studio URL and SendGrid credentials

# Start the function host
func start
```

### Deploy to Azure
```bash
# Run the automated deployment script
deploy.bat
```

Or follow the manual steps in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## Configuration

### Required Environment Variables (Azure App Settings)

| Variable | Description | Example |
|----------|-------------|---------|
| `LM_STUDIO_URL` | LM Studio API endpoint | `http://localhost:1234/v1` |
| `LM_STUDIO_MODEL` | Model name in LM Studio | `local-model` or `mistral-7b` |
| `SENDGRID_SID` | SendGrid SID for authentication | `your_sendgrid_sid_here` |
| `SENDGRID_SECRET` | SendGrid Secret for authentication | `your_sendgrid_secret_here` |
| `FROM_EMAIL` | Sender email address | `noreply@contentrepurposing.com` |

### LM Studio Configuration

LM Studio provides an OpenAI-compatible API endpoint. The following settings are used:

- **Base URL**: `http://localhost:1234/v1` (default, configurable via `LM_STUDIO_URL`)
- **API Key**: `lm-studio` (placeholder, not validated by LM Studio)
- **Model**: Configurable via `LM_STUDIO_MODEL` (default: `local-model`)

### SendGrid Configuration

SendGrid is configured using SID/Secret authentication:
- **SID**: Set in your environment variables (e.g., `SENDGRID_SID=your_sid_here`)
- **Secret**: Set in your environment variables (e.g., `SENDGRID_SECRET=your_secret_here`)
- **SMTP Host**: `smtp.sendgrid.net`
- **SMTP Port**: `587`

### CORS Configuration

CORS is configured in `host.json` to allow:
- GitHub Pages domains (`https://*.github.io`)
- Local development (`http://localhost:3000`)

To add your custom domain, update the `cors.allowedOrigins` array in `host.json`.

## Testing

Run the test suite against a deployed function:
```bash
node test-api.js https://your-function-app.azurewebsites.net/api
```

Or test locally:
```bash
node test-api.js http://localhost:7071
```

## File Structure

```
AZURE_FUNCTIONS_API/
├── index.js                    # Main function handler (v4 SDK)
├── host.json                   # Function host configuration
├── package.json                # Dependencies and scripts
├── local.settings.json.example # Template for local development
├── .gitignore                  # Git ignore rules
├── deploy.bat                  # Automated deployment script
├── test-api.js                 # API test suite
├── DEPLOYMENT_GUIDE.md         # Detailed deployment instructions
└── README.md                   # This file
```

## Cost Estimation

Azure Functions Consumption Plan:
- **First 1M executions/month**: Free
- **After free tier**: ~$0.20 per million additional executions
- **Estimated monthly cost for development**: $0 - $5

**Note**: Using LM Studio eliminates OpenAI API costs for AI processing.

## Security Notes

- API keys and secrets are stored in Azure App Settings, never in code
- Function uses `anonymous` auth level (CORS protects against unauthorized origins)
- For production, consider adding function-level authentication or API Management
- LM Studio runs locally, keeping AI processing on-premise

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot access a disposed object" on local start | Known Core Tools bug; doesn't affect Azure deployment |
| 401 Unauthorized | Check function key in URL or authLevel setting |
| CORS errors | Verify allowed origins include your frontend domain |
| LM Studio connection errors | Ensure LM Studio is running and accessible at configured URL |
| Email not sending | Check SendGrid credentials and sender verification |
| Model not found | Verify `LM_STUDIO_MODEL` matches the loaded model in LM Studio |

## LM Studio Setup Requirements

### Minimum System Requirements
- **RAM**: 16GB+ (8GB minimum for smaller models)
- **Storage**: 10GB+ for model files
- **GPU**: Optional but recommended for faster inference

### Recommended Models
- **Mistral 7B**: Good balance of quality and performance
- **Llama 2 7B**: Meta's open-source model
- **CodeLlama**: Optimized for code generation tasks

### Starting LM Studio Server
1. Open LM Studio
2. Navigate to the "Local Server" tab
3. Load your desired model
4. Click "Start Server"
5. Verify the server is running at `http://localhost:1234`

## Support

For deployment issues, check:
1. Azure Portal → Function App → Monitor → Log Stream
2. Application Insights for error tracking
3. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step instructions
