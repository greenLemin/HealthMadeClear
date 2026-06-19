# Deployment checklist

## Netlify environment variables

Set these in **Netlify → Site configuration → Environment variables**. See [`.env.example`](../.env.example) for local development.

### Required (production and CI builds)

| Variable                        | Description                               | Where to get it                                           |
| ------------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project API URL                  | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable / anon key (safe for browser) | Supabase Dashboard → API → `anon` / publishable key       |

Apply to **Production** at minimum. Also set for **Deploy Previews** and **Branch deploys** if auth, dashboard, or contact form should work there.

**Legacy naming:** If you previously set `SUPABASE_URL` or `SUPABASE_ANON_KEY` (without the `NEXT_PUBLIC_` prefix), the build copies them to the corresponding `NEXT_PUBLIC_*` vars automatically. You must still provide a project URL — it cannot be derived from `SUPABASE_DATABASE_URL`.

**Do not** commit real keys in `netlify.toml` or the repo. Use the Netlify dashboard only.

### Auto-set on Netlify

| Variable               | Source                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Derived at build time from Netlify's `URL` or `DEPLOY_PRIME_URL` when `NETLIFY=true` |

### Optional

| Variable                    | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SENTRY_DSN`    | Client error reporting                           |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only operations (never expose to browser) |
| `RESEND_API_KEY`            | Contact form email delivery                      |
| `CONTACT_EMAIL`             | Inbox for contact form submissions               |

### After adding or changing env vars

1. **Site configuration → Build & deploy → Deploys → Trigger deploy → Clear cache and deploy site**
2. Confirm the build log passes `check-production-env.mjs` and `next build`

## Build and verify

1. Build: `npm run build`
2. Verify security headers (CSP, `X-Frame-Options`, etc.) on staging.
3. Confirm `public/og-image.svg` and `public/manifest.json` are served.
4. Run smoke tests: `npm run test:e2e`

## Post-deploy smoke checks

| Area      | Check                                                                 |
| --------- | --------------------------------------------------------------------- |
| Auth      | Sign up / login / logout on production URL                            |
| Dashboard | `/en/dashboard` redirects unauthenticated users; loads when logged in |
| Contact   | Contact form submits (or returns 503 if Supabase vars missing)        |
| CSP       | Browser console: no `connect-src` blocks to `*.supabase.co`           |

## Supabase database

If not already applied to the production project, run migrations in `supabase/migrations/` (including `009`–`011`) via `supabase db push`.
