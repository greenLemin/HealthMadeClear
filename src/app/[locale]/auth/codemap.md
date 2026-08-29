# src/app/[locale]/auth/

## Responsibility

Authentication pages using Supabase Auth.

## Sub-routes

- `login/page.tsx`: Login form
- `signup/page.tsx`: Registration form
- `callback/route.ts`: OAuth / PKCE callback (`GET`)
- `forgot-password/page.tsx`: Password reset request
- `reset-password/page.tsx`: New password form
- `confirm/route.ts`: Email confirmation (`token_hash` / PKCE `code`)

## Integration

- Uses Supabase browser client for auth operations
- Redirect handling via `sanitizeRedirectPath` from `src/lib/auth/sanitizeRedirect.ts`
- Auth state managed by `AuthProvider` component
