# Azure Functions Deployment Guide - Content Repurposing Engine

## Overview

This guide walks you through deploying the Content Repurposing Engine backend to Azure Functions. The backend provides two main API endpoints:
- `POST /api/generate-posts` - Generate social media posts from blog content using OpenAI GPT-4
- Email delivery via SendGrid (integrated into the generate-posts endpoint)

## Prerequisites

### 1. Azure Account
- Active Azure subscription with permissions to create resources
- Free tier provides enough credits for development/testing

### 2. Install Required Tools

#### Windows (PowerShell - Run as Administrator):
```powershell
# Install Azure CLI
winget install Microsoft.AzureCLI

# Install Azure Functions Core Tools
npm i -g azure-functions-core-tools@4 --unsafe-perm true
```

#### Alternative: Manual Installation
1. **Azure CLI**: Download from https://docs.microsoft.com/cli/azure/install-azure-cli
2. **Functions Core Tools**: `npm install -g azure-functions-core-tools@4`

### 3. API Keys Required
Before deployment, gather these credentials:
- **OpenAI API Key** (`sk-...`) - From https://platform.openai.com/api-keys
- **SendGrid API Key** (`SG....`) - From https://app.sendgrid.com/settings/api_keys
- **Sender Email** - Verified sender in SendGrid

## Quick Deploy (Automated)

Run the deployment script:
```bash
cd AZURE_FUNCTIONS_API/
deploy.bat
```

The script will:
1. Authenticate with Azure
2. Create resource group and storage account
3. Provision Function App on Consumption plan
4. Configure application settings
5. Install dependencies and deploy code
6. Set up CORS for your frontend

## Manual Deployment Steps

### Step 1: Login to Azure
```bash
az login
```

### Step 2: Create Resource Group
```bash
az group create --name content-repurposing-rg --location eastus2
```

### Step 3: Create Storage Account
```bash
az storage account create \
    --name cgreprodst12345 \
    --resource-group content-repurposing-rg \
    --location eastus2 \
    --sku Standard_LRS \
    --kind StorageV2
```

### Step 4: Create Function App
```bash
az functionapp create \
    --resource-group content-repurposing-rg \
    --consumption-plan-location eastus2 \
    --name content-repurposing-api \
    --storage-account cgreprodst12345 \
    --functions-version 4 \
    --runtime node \
    --runtime-version 20 \
    --os-type Windows
```

### Step 5: Configure Application Settings
```bash
# Set OpenAI API Key
az functionapp config appsettings set \
    --name content-repurposing-api \
    --resource-group content-repurposing-rg \
    --settings OPENAI_API_KEY="sk-your-key-here"

# Set SendGrid API Key
az functionapp config appsettings set \
    --name content-repurposing-api \
    --resource-group content-repurposing-rg \
    --settings SENDGRID_API_KEY="SG.your-key-here"

# Set sender email
az functionapp config appsettings set \
    --name content-repurposing-api \
    --resource-group content-repurposing-rg \
    --settings FROM_EMAIL="noreply@yourdomain.com"

# Configure CORS for GitHub Pages frontend
az functionapp cors add \
    --name content-repurposing-api \
    --resource-group content-repurposing-rg \
    --allowed-origins "https://yourusername.github.io" "http://localhost:3000"
```

### Step 6: Deploy Functions
```bash
cd AZURE_FUNCTIONS_API/
npm install --production
func azure functionapp publish content-repurposing-api --build local --nozip
```

## Local Development & Testing

### Setup Local Environment
1. Copy the example settings file:
   ```bash
   copy local.settings.json.example local.settings.json
   ```

2. Edit `local.settings.json` and add your API keys:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "OPENAI_API_KEY": "sk-your-key-here",
       "SENDGRID_API_KEY": "SG.your-key-here",
       "FROM_EMAIL": "noreply@testmail.app"
     }
   }
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the local function host:
   ```bash
   func start
   ```

### Test Locally
```bash
# Test the generate-posts endpoint
curl -X POST http://localhost:7071/api/generate-posts \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"Your blog post content here\",\"email\":\"test@example.com\"}"

# Expected response (200 OK):
{
  "success": true,
  "posts": ["Post 1...", "Post 2...", "Post 3...", "Post 4..."],
  "emailSent": true,
  "timestamp": "2026-06-05T00:00:00.000Z"
}
```

## API Contract

### Endpoint: POST /api/generate-posts

**Request:**
```json
{
  "content": "Blog post content to repurpose",
  "email": "optional@email.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "posts": [
    "Post for Twitter...",
    "Post for LinkedIn...",
    "Post for Facebook...",
    "Post for Instagram..."
  ],
  "emailSent": false,
  "timestamp": "2026-06-05T00:00:00.000Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Content is required and must be a non-empty string"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Internal server error. Please try again later."
}
```

## Frontend Configuration

After deployment, update your frontend environment:

### For GitHub Pages (.env.production or GitHub Secrets):
```
AZURE_FUNCTION_URL=https://content-repurposing-api.azurewebsites.net/api
```

The frontend will call: `${AZURE_FUNCTION_URL}/generate-posts`

## Monitoring & Troubleshooting

### View Logs in Azure Portal
1. Go to Azure Portal → Function App → Monitor
2. Check Application Insights for errors and performance metrics

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Ensure function key is included or authLevel is set correctly |
| CORS Error | Verify allowed origins include your frontend domain |
| OpenAI API Error | Check OPENAI_API_KEY is valid and has credits |
| Email Not Sending | Verify SendGrid credentials and sender verification |
| Function Timeout | Increase timeout in host.json if content is very long |

## Cost Estimation (Consumption Plan)

- **First 1M executions/month**: Free
- **After free tier**: ~$0.20 per million additional executions
- **Memory**: 355 MB default, scales to 1 GB max
- **Estimated monthly cost for development**: $0 - $5

## Rollback Procedure

To rollback to a previous deployment:
```bash
# View deployment history
az functionapp deployment list-publishing-credentials \
    --name content-repurposing-api \
    --resource-group content-repurposing-rg

# Redeploy from local code
func azure functionapp publish content-repurposing-api --build local --nozip
```

## Security Notes

1. **Never commit API keys** - They are stored in Azure App Settings, not in code
2. **Use Managed Identity** for production to avoid storing secrets
3. **Enable HTTPS only** - Configure custom domain with SSL certificate
4. **Rate limiting** - Consider adding API management layer for production
