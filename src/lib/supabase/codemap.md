# src/lib/supabase/

## Responsibility

Supabase client configuration and environment handling.

## Key Files

- `client.ts`: Browser-side Supabase client — creates `createBrowserClient` or falls back to mock client in dev
- `server.ts`: Server-side Supabase client — creates `createServerClient` with cookie handling
- `middleware.ts`: Next.js middleware Supabase client — refreshes session, guards dashboard routes
- `env.ts`: Environment config — reads `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`, detects mock/CI/placeholder modes
- `mockClient.ts`: In-memory Supabase mock for local development without real Supabase — stores data in cookies, provides mock user/session, supports basic CRUD operations on all tables

## Integration

- Consumed by: All components and lib modules needing Supabase access
- Depends on: `@supabase/ssr`, `@supabase/supabase-js`
