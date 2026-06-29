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
