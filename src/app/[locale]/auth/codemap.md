# src/app/[locale]/auth/

## Responsibility

Authentication pages using Supabase Auth.

## Sub-routes

- `login/page.tsx`: Login form
- `signup/page.tsx`: Registration form
- `callback/page.tsx`: OAuth callback handler
- `forgot-password/page.tsx`: Password reset request
- `reset-password/page.tsx`: New password form
- `confirm/page.tsx`: Email confirmation status

## Integration

- Uses Supabase browser client for auth operations
- Redirect handling via `sanitizeRedirectPath` from `src/lib/auth/sanitizeRedirect.ts`
- Auth state managed by `AuthProvider` component
