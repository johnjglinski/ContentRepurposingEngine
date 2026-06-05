# Testing Guide - LM Studio & SendGrid Configuration

## Overview
This guide provides step-by-step instructions for testing the updated Azure Functions backend with LM Studio and SendGrid integration.

---

## Prerequisites

### 1. LM Studio Setup
- [ ] LM Studio installed from [https://lmstudio.ai](https://lmstudio.ai)
- [ ] At least one model downloaded and loaded
- [ ] Local server running on `http://localhost:1234`

### 2. SendGrid Configuration
- [ ] SendGrid account active
- [ ] SID and Secret configured in environment variables
- [ ] Sender email verified in SendGrid dashboard

### 3. Azure Functions Tools
- [ ] Azure Functions Core Tools installed (`npm install -g azure-functions-core-tools@4`)
- [ ] Azure CLI installed (for deployment testing)

---

## Test 1: LM Studio Connection

### Objective
Verify that the Azure Function can connect to LM Studio and generate content.

### Steps

#### 1.1 Start LM Studio Server
```bash
# Open LM Studio
# Navigate to "Local Server" tab
# Load your model (e.g., Mistral 7B)
# Click "Start Server"
```

#### 1.2 Verify LM Studio is Running
```bash
# Test the connection
curl http://localhost:1234/v1/models

# Expected response: JSON list of available models
```

#### 1.3 Configure Local Settings
```json
// local.settings.json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "LM_STUDIO_URL": "http://localhost:1234/v1",
    "LM_STUDIO_MODEL": "local-model",
    "SENDGRID_SID": "your_sendgrid_sid_here",
    "SENDGRID_SECRET": "your_sendgrid_secret_here",
    "FROM_EMAIL": "noreply@contentrepurposing.com"
  }
}
```

#### 1.4 Start Azure Functions Locally
```bash
cd AZURE_FUNCTIONS_API
npm install
func start
```

#### 1.5 Test Content Generation
```bash
# Test with curl
curl -X POST http://localhost:7071/api/generate-posts \
  -H "Content-Type: application/json" \
  -d '{"content": "How to build a successful startup in 2024"}'

# Expected response:
# {
#   "success": true,
#   "posts": ["Post 1...", "Post 2...", "Post 3...", "Post 4..."],
#   "emailSent": false,
#   "timestamp": "2026-06-05T..."
# }
```

### Expected Results
- ✅ HTTP 200 response
- ✅ `success: true`
- ✅ Array of 4 social media posts
- ✅ Each post under 280 characters

---

## Test 2: SendGrid Email Delivery

### Objective
Verify that emails are sent successfully using the provided SendGrid credentials.

### Steps

#### 2.1 Test Email Endpoint
```bash
# Test with email notification
curl -X POST http://localhost:7071/api/generate-posts \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The future of artificial intelligence in healthcare",
    "email": "your-test-email@example.com"
  }'

# Expected response:
# {
#   "success": true,
#   "posts": [...],
#   "emailSent": true,
#   "timestamp": "2026-06-05T..."
# }
```

#### 2.2 Verify Email Delivery
- Check the test email inbox
- Verify email contains all 4 posts
- Check email formatting and styling

### Expected Results
- ✅ HTTP 200 response
- ✅ `emailSent: true`
- ✅ Email received in inbox
- ✅ Email contains formatted posts

---

## Test 3: Error Handling

### Objective
Verify proper error handling for various failure scenarios.

#### 3.1 Missing Content
```bash
curl -X POST http://localhost:7071/api/generate-posts \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Expected: 400 Bad Request
```

#### 3.2 Invalid Email Format
```bash
curl -X POST http://localhost:7071/api/generate-posts \
  -H "Content-Type: application/json" \
  -d '{"content": "Test content", "email": 12345}'

# Expected: 400 Bad Request
```

#### 3.3 LM Studio Not Running
```bash
# Stop LM Studio server
# Then test:
curl -X POST http://localhost:7071/api/generate-posts \
  -H "Content-Type: application/json" \
  -d '{"content": "Test content"}'

# Expected: 503 Service Unavailable
# Error message: "AI service (LM Studio) is not available..."
```

#### 3.4 Empty Content
```bash
curl -X POST http://localhost:7071/api/generate-posts \
  -H "Content-Type: application/json" \
  -d '{"content": "   "}'

# Expected: 400 Bad Request
```

---

## Test 4: CORS Configuration

### Objective
Verify CORS headers are properly set for cross-origin requests.

#### 4.1 Test Preflight Request
```bash
curl -X OPTIONS http://localhost:7071/api/generate-posts \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

# Expected: 204 No Content
# Headers:
#   Access-Control-Allow-Origin: *
#   Access-Control-Allow-Methods: POST, OPTIONS
#   Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Test 5: End-to-End Integration

### Objective
Test the complete flow from frontend to backend.

#### 5.1 Start Full Stack
```bash
# Terminal 1: Start LM Studio server
# Terminal 2: Start Azure Functions
cd AZURE_FUNCTIONS_API
func start

# Terminal 3: Start Next.js frontend
cd ..
npm run dev
```

#### 5.2 Test via Frontend
1. Open `http://localhost:3000`
2. Enter blog content in the input field
3. (Optional) Enter email address
4. Click "Generate Posts"
5. Verify posts are displayed
6. (Optional) Check email for notification

---

## Test 6: Azure Deployment

### Objective
Verify the function works correctly when deployed to Azure.

#### 6.1 Deploy to Azure
```bash
cd AZURE_FUNCTIONS_API
deploy.bat
```

#### 6.2 Configure Azure App Settings
```bash
# Set environment variables in Azure
az functionapp config appsettings set \
  --name <your-function-app> \
  --resource-group <your-resource-group> \
  --settings \
    LM_STUDIO_URL="http://your-lm-studio-server:1234/v1" \
    LM_STUDIO_MODEL="local-model" \
    SENDGRID_SID="your_sendgrid_sid_here" \
    SENDGRID_SECRET="your_sendgrid_secret_here" \
    FROM_EMAIL="noreply@contentrepurposing.com"
```

**Note**: For Azure deployment, LM Studio must be accessible via network (not localhost). Consider:
- Running LM Studio on a VM with a public IP
- Using Azure Virtual Network for private connectivity
- Or using a cloud-based AI service instead

#### 6.3 Test Deployed Function
```bash
curl -X POST https://<your-function-app>.azurewebsites.net/api/generate-posts \
  -H "Content-Type: application/json" \
  -d '{"content": "Test content for Azure deployment"}'
```

---

## Test 7: Performance Testing

### Objective
Verify response times and handling of concurrent requests.

#### 7.1 Response Time Test
```bash
# Test response time
time curl -X POST http://localhost:7071/api/generate-posts \
  -H "Content-Type: application/json" \
  -d '{"content": "Short test content"}'

# Expected: Response within 10-30 seconds (depending on model and hardware)
```

#### 7.2 Concurrent Requests
```bash
# Test with multiple concurrent requests
for i in {1..5}; do
  curl -X POST http://localhost:7071/api/generate-posts \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"Test content $i\"}" &
done
wait

# Verify all requests complete successfully
```

---

## Troubleshooting

### Common Issues

#### LM Studio Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:1234
```
**Solution**: Ensure LM Studio server is running and accessible at the configured URL.

#### SendGrid Authentication Failed
```
Error: Invalid login: 535 Authentication failed
```
**Solution**: Verify SENDGRID_SID and SENDGRID_SECRET are correct and properly set.

#### Model Not Found
```
Error: The model 'local-model' does not exist
```
**Solution**: Check the model name in LM Studio and update LM_STUDIO_MODEL accordingly.

#### CORS Errors in Browser
```
Access to fetch has been blocked by CORS policy
```
**Solution**: Verify CORS settings in `host.json` include your frontend domain.

---

## Validation Checklist

Use this checklist to verify all functionality:

- [ ] LM Studio server starts successfully
- [ ] Azure Functions connects to LM Studio
- [ ] Content generation returns 4 posts
- [ ] Posts are under 280 characters
- [ ] Email delivery works with SendGrid
- [ ] Error handling works for missing content
- [ ] Error handling works for invalid email
- [ ] Error handling works when LM Studio is down
- [ ] CORS headers are properly set
- [ ] Frontend integration works end-to-end
- [ ] Azure deployment works correctly
- [ ] Response times are acceptable

---

## Next Steps

After completing all tests:

1. **Document any issues** found during testing
2. **Update configuration** if needed based on test results
3. **Optimize performance** if response times are slow
4. **Set up monitoring** in Azure for production
5. **Configure alerts** for service failures

---

## Support

For additional help:
- Check Azure Portal → Function App → Monitor → Log Stream
- Review Application Insights for detailed error tracking
- Consult the [README.md](./README.md) for configuration details
