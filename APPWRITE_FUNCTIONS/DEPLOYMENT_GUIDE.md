# Appwrite Functions Deployment Guide

This guide will walk you through deploying the Content Repurposing Engine backend to Appwrite.

## Prerequisites

1. **Appwrite Account** - Sign up at [cloud.appwrite.io](https://cloud.appwrite.io)
2. **Appwrite CLI** - Install the Appwrite CLI:
   ```bash
   npm install -g appwrite-cli
   ```
3. **Appwrite API Key** - Create an API key in Appwrite Console > Settings > API Keys

## Initial Setup

### 1. Login to Appwrite CLI

```bash
appwrite login
```

Enter your Appwrite endpoint (e.g., `https://cloud.appwrite.io/v1`) and credentials.

### 2. Create a New Project

```bash
appwrite projects create --projectId content-repurposing-engine --name "Content Repurposing Engine"
```

Or create a project in the Appwrite Console and note the Project ID.

### 3. Configure API Key

Use the provided API key:
```
standard_c452fafe2b01a12d274359742d8eafa51f88081bffc906a6626258d49e3ac5285bc5f632452c7c65ee28c3ac62f2cfb5f33cd7fbed2d1bea63362b02a2326571c0f8c64ec830c573c28f63250872d6bfb3f5b6b83c60aaf9812b9367e6e2abef6edcfdfdc9e2686957fa6e5fe3a2ce02d8af385f266f3454a6ea321635439e4a
```

Add it to your Appwrite project:
```bash
appwrite projects update-api-key --projectId content-repurposing-engine --key "your-api-key-name"
```

## Environment Variables

Set the following environment variables in your Appwrite project for each function:

### Generate Posts Function
| Variable | Description | Example |
|----------|-------------|---------|
| `LM_STUDIO_URL` | LM Studio API endpoint | `http://localhost:1234/v1` |
| `LM_STUDIO_MODEL` | Model name in LM Studio | `local-model` |
| `SENDGRID_SID` | SendGrid SID for email | `SID-...` |
| `SENDGRID_SECRET` | SendGrid API secret | `...` |
| `FROM_EMAIL` | Sender email address | `noreply@contentrepurposing.com` |

### Send Email Function
| Variable | Description | Example |
|----------|-------------|---------|
| `SENDGRID_SID` | SendGrid SID for email | `SID-...` |
| `SENDGRID_SECRET` | SendGrid API secret | `...` |
| `FROM_EMAIL` | Sender email address | `noreply@contentrepurposing.com` |

### Stripe Webhooks Function
| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |

### Create Checkout Session Function
| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |

## Deploying Functions

### Option 1: Using Appwrite CLI

Navigate to the APPWRITE_FUNCTIONS directory and deploy each function:

```bash
cd APPWRITE_FUNCTIONS

# Deploy generate-posts function
cd generate-posts
appwrite functions create --functionId generate-posts --name "Generate Posts" --runtime node-18.0 --execute any
appwrite functions createDeployment --functionId generate-posts --entrypoint src/main.js --code ./ --activate true
cd ..

# Deploy send-email function
cd send-email
appwrite functions create --functionId send-email --name "Send Email" --runtime node-18.0 --execute any
appwrite functions createDeployment --functionId send-email --entrypoint src/main.js --code ./ --activate true
cd ..

# Deploy webhooks-stripe function
cd webhooks-stripe
appwrite functions create --functionId webhooks-stripe --name "Stripe Webhooks" --runtime node-18.0 --execute any
appwrite functions createDeployment --functionId webhooks-stripe --entrypoint src/main.js --code ./ --activate true
cd ..

# Deploy create-checkout-session function
cd create-checkout-session
appwrite functions create --functionId create-checkout-session --name "Create Checkout Session" --runtime node-18.0 --execute any
appwrite functions createDeployment --functionId create-checkout-session --entrypoint src/main.js --code ./ --activate true
cd ..
```

### Option 2: Using Appwrite Console

1. Go to your Appwrite project in the console
2. Navigate to **Functions** in the sidebar
3. Click **Create Function**
4. For each function:
   - Set the function ID and name
   - Choose Node.js 18.0 runtime
   - Upload the function code (zip the function directory)
   - Set the entrypoint to `src/main.js`
   - Add environment variables
   - Set execution permissions to `any`

## Function Endpoints

After deployment, your functions will be available at:

| Function | Endpoint |
|----------|----------|
| Generate Posts | `https://[APPWRITE_ENDPOINT]/v1/functions/generate-posts/execute` |
| Send Email | `https://[APPWRITE_ENDPOINT]/v1/functions/send-email/execute` |
| Stripe Webhooks | `https://[APPWRITE_ENDPOINT]/v1/functions/webhooks-stripe/execute` |
| Create Checkout Session | `https://[APPWRITE_ENDPOINT]/v1/functions/create-checkout-session/execute` |

## Testing Functions

### Test Generate Posts

```bash
curl -X POST https://[APPWRITE_ENDPOINT]/v1/functions/generate-posts/execute \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: [PROJECT_ID]" \
  -d '{"content": "Your blog post content here", "email": "user@example.com"}'
```

### Test Send Email

```bash
curl -X POST https://[APPWRITE_ENDPOINT]/v1/functions/send-email/execute \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: [PROJECT_ID]" \
  -d '{"email": "user@example.com", "posts": ["Post 1", "Post 2"]}'
```

### Test Create Checkout Session

```bash
curl -X POST https://[APPWRITE_ENDPOINT]/v1/functions/create-checkout-session/execute \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: [PROJECT_ID]" \
  -d '{"priceId": "price_xxxxx"}'
```

## Frontend Integration

Update your Next.js frontend to use the Appwrite function endpoints:

1. Add Appwrite configuration to your `.env.local`:
   ```
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://[APPWRITE_ENDPOINT]/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=[PROJECT_ID]
   ```

2. Update API routes to call Appwrite functions instead of Azure Functions

## Troubleshooting

### Common Issues

1. **Function timeout**: Increase the timeout in function settings (default 30s)
2. **CORS errors**: Ensure CORS headers are set in function responses
3. **Environment variables**: Verify all required env vars are set in Appwrite console
4. **Deployment failures**: Check function logs in Appwrite console

### Viewing Logs

```bash
appwrite functions listExecutions --functionId generate-posts
```

Or view logs in the Appwrite Console under Functions > [Function Name] > Executions

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Use Appwrite's built-in authentication** for user-specific operations
3. **Validate all inputs** in your functions
4. **Set appropriate CORS policies** for production
5. **Use environment variables** for all secrets

## Migration from Azure Functions

Key differences to note:

| Feature | Azure Functions | Appwrite Functions |
|---------|-----------------|-------------------|
| Runtime | .NET, Node.js, Python, etc. | Node.js, Python, PHP, etc. |
| Authentication | Azure AD, API keys | Appwrite built-in auth |
| Deployment | Azure CLI, VS Code | Appwrite CLI, Console |
| Scaling | Automatic | Automatic |
| Pricing | Consumption-based | Based on execution time |

## Next Steps

1. Set up Appwrite Database for user data
2. Configure Appwrite Authentication for user management
3. Set up Appwrite Storage for file uploads
4. Implement proper error handling and logging
5. Set up monitoring and alerts

## Support

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Discord](https://appwrite.io/discord)
- [Appwrite GitHub](https://github.com/appwrite/appwrite)
