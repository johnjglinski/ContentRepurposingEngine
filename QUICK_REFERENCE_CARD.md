# Quick Reference Card - Content Repurposing Engine

## 🚀 5-Minute Setup

### 1. GitHub Repository
```bash
# Create and push repository
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ContentRepurposingEngine.git
git push -u origin main
```

### 2. Launch Codespace
- Repository → Code → Codespaces → New codespace
- Wait 2-3 minutes
- Run: `npm install`

### 3. API Keys (Get these first!)
- **OpenAI**: https://platform.openai.com/ → API Keys
- **Stripe**: https://dashboard.stripe.com/ → API Keys
- **SendGrid**: https://sendgrid.com/ → API Keys

### 4. Environment Variables
Edit `.env.local`:
```env
OPENAI_API_KEY=sk_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
SENDGRID_API_KEY=SG_your_key_here
FROM_EMAIL=noreply@yourdomain.com
```

## 🌐 Deployment Commands

### Frontend (GitHub Pages)
```bash
npm run build
git add .
git commit -m "Production build"
git push
```

### Backend (Azure Functions)
```bash
cd AZURE_FUNCTIONS_API
npm install
cd ..
zip -r azure-functions.zip AZURE_FUNCTIONS_API/
az functionapp deployment source config-zip \
  --name ContentRepurposingEngine-API \
  --resource-group YOUR_GROUP \
  --src azure-functions.zip
```

## 💳 Stripe Test Card
- **Test Card**: `4242 4242 4242 4242`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## 🧪 Testing URLs

### Local Development
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/generate-posts

### Production
- Frontend: https://YOUR_USERNAME.github.io/ContentRepurposingEngine
- Backend: https://ContentRepurposingEngine-API.azurewebsites.net/api

## 🔧 Critical Configuration

### Azure Function Environment Variables
```
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com
```

### CORS Settings (Azure)
- Allowed Origins: `https://YOUR_USERNAME.github.io`
- Allowed Methods: GET, POST, OPTIONS
- Allowed Headers: *

### GitHub Pages Settings
- Source: GitHub Actions
- Custom Domain: yourdomain.com (optional)
- Enforce HTTPS: ✓

## 📊 Monitoring

### Daily Checks
- Stripe Dashboard → Payments
- SimpleAnalytics → Traffic
- Application Health

### Weekly Tasks
- Update dependencies: `npm update`
- Review user feedback
- Analyze usage patterns

## 🚨 Troubleshooting

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Issues
- Check environment variables in Azure
- Verify CORS settings
- Test API endpoint directly

### Payment Issues
- Use Stripe test mode
- Verify webhook endpoint
- Check API keys

## 🎯 Next Steps

1. **Test Everything Locally**
2. **Deploy to Production**
3. **Monitor Performance**
4. **Collect User Feedback**
5. **Iterate and Improve**

## 📞 Support

- **GitHub Issues**: Report bugs
- **Stripe Support**: Payment issues
- **OpenAI Support**: API problems
- **SendGrid Support**: Email issues
- **Azure Support**: Backend problems

---

**Remember**: This is designed for zero operational time. Once set up, it should run automatically!