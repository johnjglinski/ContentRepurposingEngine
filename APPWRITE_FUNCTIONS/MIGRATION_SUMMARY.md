# Azure Functions to Appwrite Migration Summary

## Overview

This document summarizes the migration of the Content Repurposing Engine backend from Azure Functions to Appwrite Functions.

## What Was Migrated

### Functions

| Azure Function | Appwrite Function | Status |
|----------------|-------------------|--------|
| `generate-posts` | `generate-posts` | ✅ Migrated |
| `send-email` | `send-email` | ✅ Migrated |
| `webhooks/stripe` | `webhooks-stripe` | ✅ Migrated |
| `create-checkout-session` | `create-checkout-session` | ✅ Migrated |

## Architecture Changes

### Before (Azure Functions)
```
Frontend (Next.js) → Azure Functions → External Services
                     ↓
              Azure Infrastructure
```

### After (Appwrite Functions)
```
Frontend (Next.js) → Next.js API Routes → Appwrite Functions → External Services
                                        ↓
                                   Appwrite Infrastructure
```

## Key Differences

| Feature | Azure Functions | Appwrite Functions |
|---------|-----------------|-------------------|
| **Runtime** | Node.js 18+ | Node.js 18.0 |
| **Authentication** | Azure AD, API Keys | Built-in Appwrite Auth |
| **Deployment** | Azure CLI, VS Code | Appwrite CLI, Console |
| **Scaling** | Consumption Plan | Automatic |
| **Pricing** | Per-execution | Execution time-based |
| **CORS** | Manual configuration | Built-in support |
| **Environment Variables** | App Settings | Function Variables |

## File Structure

```
ContentRepurposingEngine/
├── APPWRITE_FUNCTIONS/           # New Appwrite functions
│   ├── appwrite.json            # Appwrite project config
│   ├── deploy.bat               # Windows deployment script
│   ├── deploy.sh                # Linux/Mac deployment script
│   ├── DEPLOYMENT_GUIDE.md      # Detailed deployment guide
│   ├── MIGRATION_SUMMARY.md     # This file
│   ├── generate-posts/
│   │   ├── package.json
│   │   └── src/main.js
│   ├── send-email/
│   │   ├── package.json
│   │   └── src/main.js
│   ├── webhooks-stripe/
│   │   ├── package.json
│   │   └── src/main.js
│   └── create-checkout-session/
│       ├── package.json
│       └── src/main.js
├── src/
│   ├── lib/
│   │   └── appwrite.ts          # New Appwrite client
│   └── app/api/
│       ├── generate-posts/route.ts   # Updated
│       ├── send-email/route.ts       # Updated
│       ├── webhooks/stripe/route.ts  # Updated
│       └── create-checkout-session/route.ts  # Updated
└── .env.example                 # Updated with Appwrite config
```

## API Contracts

### Generate Posts

**Endpoint:** `POST /api/generate-posts`

**Request:**
```json
{
  "content": "Blog post content...",
  "email": "user@example.com"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "posts": ["Post 1", "Post 2", "Post 3", "Post 4"],
  "emailSent": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Send Email

**Endpoint:** `POST /api/send-email`

**Request:**
```json
{
  "email": "user@example.com",
  "posts": ["Post 1", "Post 2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Create Checkout Session

**Endpoint:** `POST /api/create-checkout-session`

**Request:**
```json
{
  "priceId": "price_xxxxx",
  "successUrl": "https://example.com/success",  // Optional
  "cancelUrl": "https://example.com/cancel",    // Optional
  "customerEmail": "user@example.com"           // Optional
}
```

**Response:**
```json
{
  "id": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/..."
}
```

### Stripe Webhooks

**Endpoint:** `POST /api/webhooks/stripe`

**Headers:**
- `stripe-signature`: Stripe webhook signature

**Body:** Raw Stripe event payload

**Response:**
```json
{
  "received": true
}
```

## Environment Variables

### New Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite API endpoint | Yes |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite project ID | Yes |
| `APPWRITE_API_KEY` | Appwrite API key (server-side) | Yes |
| `USE_APPWRITE_CHECKOUT` | Toggle Appwrite checkout function | No |
| `USE_APPWRITE_WEBHOOK` | Toggle Appwrite webhook function | No |

### Removed Variables

| Variable | Reason |
|----------|--------|
| `AZURE_FUNCTION_URL` | No longer using Azure Functions |

## Deployment Steps

### 1. Initial Setup

```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login to Appwrite
appwrite login
```

### 2. Create Appwrite Project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a new project: `content-repurposing-engine`
3. Note the Project ID

### 3. Deploy Functions

```bash
cd APPWRITE_FUNCTIONS

# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### 4. Configure Environment Variables

In Appwrite Console, set the following for each function:

**Generate Posts:**
- `LM_STUDIO_URL`
- `LM_STUDIO_MODEL`
- `SENDGRID_SID`
- `SENDGRID_SECRET`
- `FROM_EMAIL`

**Send Email:**
- `SENDGRID_SID`
- `SENDGRID_SECRET`
- `FROM_EMAIL`

**Stripe Webhooks:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Create Checkout Session:**
- `STRIPE_SECRET_KEY`

### 5. Update Frontend Configuration

Create `.env.local` with:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

### 6. Test the Migration

```bash
# Start the development server
npm run dev

# Test generate posts
curl -X POST http://localhost:3000/api/generate-posts \
  -H "Content-Type: application/json" \
  -d '{"content": "Test content", "email": "test@example.com"}'
```

## Rollback Plan

If issues arise, you can rollback to Azure Functions:

1. Keep the `AZURE_FUNCTION_URL` in your `.env.local`
2. Update API routes to use Azure Functions instead of Appwrite
3. Redeploy Azure Functions if needed

## Benefits of Appwrite

1. **Simplified Infrastructure** - All-in-one backend solution
2. **Built-in Authentication** - User management out of the box
3. **Database Integration** - Easy to add Appwrite Database later
4. **File Storage** - Built-in storage for user uploads
5. **Real-time Subscriptions** - WebSocket support for live updates
6. **Better Developer Experience** - Unified API and console

## Next Steps

1. ✅ Create Appwrite functions
2. ✅ Update Next.js API routes
3. ✅ Create deployment scripts
4. ⬜ Deploy to Appwrite Cloud
5. ⬜ Configure environment variables
6. ⬜ Test all functions
7. ⬜ Set up Appwrite Database for user data
8. ⬜ Implement Appwrite Authentication
9. ⬜ Set up monitoring and logging
10. ⬜ Update production environment

## Troubleshooting

### Common Issues

1. **Function Timeout**
   - Increase timeout in Appwrite function settings
   - Default is 30 seconds

2. **CORS Errors**
   - Ensure `Access-Control-Allow-Origin` header is set
   - Check Appwrite project settings

3. **Environment Variables Not Found**
   - Verify variables are set in Appwrite Console
   - Check function-specific variables

4. **Deployment Failures**
   - Check function logs in Appwrite Console
   - Verify package.json dependencies

## Support Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Functions Guide](https://appwrite.io/docs/functions)
- [Appwrite Discord](https://appwrite.io/discord)
- [Stripe Integration Guide](https://stripe.com/docs)
