# src/components/providers/

## Responsibility

React context providers for global state.

## Key Files

- `AuthProvider.tsx`: Supabase Auth context — provides user, session, signOut, loading state. Initializes on mount, subscribes to auth state changes.

## Integration

- Consumed by: `useAuth()` hook, entire app tree via `layout.tsx`
- Depends on: `src/lib/supabase/client.ts`, `src/i18n/navigation.ts`
