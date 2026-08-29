# src/lib/supabase/

## Responsibility

Supabase client configuration and environment handling.

## Key Files

- `client.ts`: Browser-side Supabase client — creates `createBrowserClient` or falls back to mock client in dev
- `server.ts`: Server-side Supabase client — creates `createServerClient` with cookie handling
- `middleware.ts`: Next.js middleware Supabase client — refreshes session, guards dashboard routes
- `env.ts`: Environment config — reads `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`, detects mock/CI/placeholder modes
- `mockClient.ts`: Re-exports mock Supabase client interface and entrypoint constructed from `mock/` modules
- `mock/types.ts`: Mock DB schema, query builder filter/mutation interfaces, and cookie store types
- `mock/utils.ts`: Mock ID generation, timestamping, JSON parser, and column selection helpers
- `mock/defaults.ts`: Factory functions for default accounts, profiles, auth state, and DB tables
- `mock/normalizers.ts`: Data normalization and migration helpers for cookie persistence
- `mock/store.ts`: Storage persistence handlers (cookie/document) and user/session builders
- `mock/queryBuilder.ts`: In-memory query builder, filtering, ordering, pagination, and table mutations
- `mock/auth.ts`: In-memory Supabase Auth (`exchangeCodeForSession`, `verifyOtp`, password reset/confirm codes)
- `schema.ts`: PostgREST `onConflict` targets (`QUIZ_ATTEMPTS_ON_CONFLICT`, `LESSON_PROGRESS_ON_CONFLICT`)
- `schema.test.ts`: Asserts conflict targets and pins 014/015/repair runbook invariants

## Integration

- Consumed by: All components and lib modules needing Supabase access
- Depends on: `@supabase/ssr`, `@supabase/supabase-js`
