# HealthMadeClear — Production Deployment Guide

This document details the configuration, build, and verification steps for deploying HealthMadeClear (HMC) to the production environments (Netlify and Supabase).

---

## 1. Prerequisites & Environment Setup

HMC runs as a localized Next.js application. All configurations must be mapped before triggering the production build.

### Netlify Environment Variables

Configure these variables in the Netlify site settings dashboard (**Site configuration > Environment variables**):

| Variable Name                   | Description                                             | Example / Required              |
| ------------------------------- | ------------------------------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | Canonical site URL (used for sitemap and metadata)      | `https://healthmadeclear.com`   |
| `NEXT_PUBLIC_SUPABASE_URL`      | Production Supabase database endpoint                   | `https://your-proj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production Supabase anonymous API key                   | `eyJhbGciOiJIUzI1NiIsIn...`     |
| `NEXT_PUBLIC_SENTRY_DSN`        | (Optional) Sentry project DSN for client error tracking | `https://sentry.io/12345`       |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | (Optional) Google Analytics 4 Measurement ID            | `G-XXXXXXXXXX`                  |
| `NODE_VERSION`                  | Locked Node.js version                                  | `22`                            |
| `NPM_VERSION`                   | Locked npm package manager version                      | `10`                            |

---

## 2. Supabase Production Migration

All database tables, Row Level Security (RLS) policies, and database triggers must be pushed to the production database.

### Workflow:

1. Ensure the Supabase CLI is authenticated and linked:
   ```bash
   supabase login
   supabase link --project-ref <your-production-project-ref>
   ```
2. Verify migrations status:
   ```bash
   supabase migration list --linked
   ```
3. Apply all local migrations to the remote database:
   ```bash
   supabase db push
   ```

---

## 3. Production Build & Deployment Pipeline

Netlify automates builds when pushing to the `main` branch. The build pipeline executes the following sequence:

1. **Pre-build check**: `check-production-env.mjs` verifies the presence of required Supabase environment variables. If missing, the build terminates to prevent a broken auth state.
2. **Content Bundler** (`prebuild`): `npm run content:bundle` parses all MDX content, validates metadata, and builds static search indexes.
3. **Next.js build**: Compiles TypeScript, runs static site generation (SSG) for all localized paths (`/en`, `/es`, `/en/learn`, etc.).

---

## 4. Post-Deployment Verification (Go/No-Go)

After the build completes, conduct these checks on the live deployment:

1. **API Rate Limiting**: Submit a contact form rapidly 6 times from a single device. The 6th request must return an HTTP 429 status code.
2. **Locale Routing**: Toggle Spanish (`/es`) and trigger the "Forgot Password" flow. Confirm the email reset link directs back to `/es/auth/reset-password`.
3. **Accessibility**: Tab navigation must highlight all active interactive headers and controls cleanly.
4. **Analytics**: Navigating between learning pages must fire GA network hits.

---

## 5. Rate Limiting Limitations

The contact form API (`/api/contact`) uses an **in-memory** rate limiter (`src/lib/rateLimit.ts`). Each serverless instance keeps its own counter map.

**Implications:**

- **Cold starts reset counters** — after a Netlify function cold start, prior request counts for that instance are lost.
- **Multi-instance bypass** — traffic spread across multiple warm instances may exceed the configured limit (5 requests per 10 minutes per IP) because limits are not shared globally.
- **Not suitable for abuse prevention alone** — treat this as a lightweight guardrail. For stronger protection, add an edge or Redis-backed limiter, or use Netlify's built-in form spam filtering.

The limiter is still useful for blocking rapid automated bursts against a single instance during normal traffic patterns.

---

## 6. Uptime Monitoring Setup

Configure an external uptime monitor to ping production on a fixed interval (recommended: every 1–5 minutes).

### Recommended checks

| Check       | URL                                    | Expected |
| ----------- | -------------------------------------- | -------- |
| Home (EN)   | `https://healthmadeclear.com/en`       | HTTP 200 |
| Home (ES)   | `https://healthmadeclear.com/es`       | HTTP 200 |
| Learn index | `https://healthmadeclear.com/en/learn` | HTTP 200 |

### Provider options

- **UptimeRobot** (free tier): Create an HTTP(s) monitor for each URL above. Set alert contacts (email/SMS/Slack).
- **Better Stack / Pingdom / StatusCake**: Same pattern — HTTP monitor, 200 status, alert on 2+ consecutive failures.

### Alert routing

1. Add at least one email alert contact.
2. Optionally connect a Slack or PagerDuty webhook for on-call rotation.
3. Document the public status page URL if your provider offers one.

---

## 7. Content Security Policy Verification

CSP headers are defined in `next.config.mjs` and applied to all routes. After each production deploy, verify they are present and not overridden by Netlify.

### Manual check

```bash
curl -sI https://healthmadeclear.com/en | grep -i content-security-policy
```

Confirm the response includes a `Content-Security-Policy` header with the expected directives (e.g. `default-src 'self'`, Supabase connect-src entries, analytics domains if enabled).

### Browser check

1. Open DevTools → Network → select the document request for `/en`.
2. Inspect Response Headers for `Content-Security-Policy`.
3. Confirm no unexpected CSP violations appear in the Console on home, learn, and dashboard pages.

If CSP is missing, check that Netlify is not stripping headers via a conflicting `_headers` file or plugin configuration.
