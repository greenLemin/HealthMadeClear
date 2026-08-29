# src/lib/auth/

## Responsibility

Server-side authentication helpers.

## Key Files

- `requireAuth.ts`: Gets authenticated user from Supabase session, redirects to login if not authenticated
- `sanitizeRedirect.ts`: Prevents open redirect attacks — only allows same-origin relative paths
- `parseAuthRedirect.ts`: Locale from pathname, OTP type guard, login error URL, recovery redirect path

## Integration

- Consumed by: Server components and API routes needing auth checks
- Depends on: `src/lib/supabase/server.ts`, `src/i18n/navigation.ts`
