# src/hooks/

## Responsibility

Custom React hooks for shared client-side logic.

## Key Files

- `useAuth.ts`: Supabase auth context consumer — wraps `AuthContext` from `AuthProvider`
- `useProgress.ts`: Learning progress orchestrator — manages lesson completion, quiz attempts, streaks, achievements. Routes through Supabase for authenticated users or localStorage for guests. Handles guest-to-authenticated progress migration.
- `useDismissibleOverlay.ts`: Click-outside/Escape-key dismiss behavior for modals/menus
- `useFocusTrap.ts`: Keyboard focus trapping for accessible modals and mobile menus

## Integration

- Consumed by: Components throughout the app
- Depends on: `src/components/providers/`, `src/lib/`
