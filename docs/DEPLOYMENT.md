# Deployment checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the production URL (required in CI).
2. Build: `npm run build`
3. Verify security headers (CSP, `X-Frame-Options`, etc.) on staging.
4. Optional: set `NEXT_PUBLIC_SENTRY_DSN` for client error reporting.
5. Confirm `public/og-image.svg` and `public/manifest.json` are served.
6. Run smoke tests: `npm run test:e2e`
