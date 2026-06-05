# Rollback Notes - DigitalOcean App Platform Deployment

## Quick Rollback Steps

### Via DigitalOcean Dashboard (Recommended)
1. Navigate to https://cloud.digitalocean.com/apps
2. Select **Content Repurposing Engine** app
3. Go to **Deployments** tab
4. Find the last successful deployment (green checkmark)
5. Click the three-dot menu → **Promote to Production**

### Via doctl CLI
```bash
# List deployments
doctl apps deployments list <app-id>

# Promote a previous deployment
doctl apps deployments promote <app-id> --deployment-id <previous-deployment-id>
```

## Rollback Triggers

Roll back immediately if:
- Homepage returns 5xx errors for >1 minute
- Appwrite API calls fail with connection errors
- SSL certificate is invalid or expired
- Static assets (JS/CSS) fail to load
- Environment variables are missing after deployment

## Pre-Rollback Checklist

Before rolling back, verify:
1. [ ] Identify the last known-good deployment ID
2. [ ] Note the current broken deployment ID for debugging
3. [ ] Capture error logs before rollback
4. [ ] Notify team if applicable

## Post-Rollback Verification

After rollback, run smoke tests:
```bash
cd scripts
node smoke-test-do.js
```

Verify manually:
- [ ] Homepage loads (200 OK)
- [ ] Dashboard renders correctly
- [ ] Appwrite integration works
- [ ] SSL is valid

## Prevention for Future Deployments

1. Always test builds locally before pushing to `main`
2. Use deployment scripts (`scripts/deploy-do.bat`) which include pre-build validation
3. Set up DigitalOcean health checks in app.yaml
4. Keep at least 3 previous deployments available (DO default retention)
