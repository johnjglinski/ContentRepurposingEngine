# Release Notes - DigitalOcean App Platform Deployment

## Version 1.0.0 — DO App Platform Release

### What's Deploying
- Static Next.js 14 frontend exported to `.next-out` directory
- All API calls routed through Appwrite Cloud Functions (`https://sfo.cloud.appwrite.io/v1`)
- Stripe checkout integration via publishable key only (no server-side secrets needed)

### Deployment Target
- **Platform**: DigitalOcean App Platform (Static Site)
- **Region**: NYC
- **Build Command**: `npm ci && npm run build`
- **Output Directory**: `.next-out`

### Environment Variables Required
| Variable | Source | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite Cloud | `https://sfo.cloud.appwrite.io/v1` |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite Dashboard | Set as Secret in DO |
| `NEXT_PUBLIC_APP_URL` | DigitalOcean | Update after first deploy |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | Live key, set as Secret |
| `NEXT_PUBLIC_ANALYTICS_ID` | SimpleAnalytics | Optional |

### Known Limitations
- Static export means no server-side rendering (SSR) or API routes
- All dynamic functionality handled by Appwrite Functions
- Build-time environment variables only (no runtime env changes without rebuild)

### Rollback Plan
See `DO_ROLLBACK_NOTES.md` for detailed rollback procedures.

### Smoke Test Checklist
See `scripts/smoke-test-do.js` and `DO_DEPLOYMENT_GUIDE.md` Step 7.
