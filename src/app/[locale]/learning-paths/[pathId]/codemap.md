# src/app/[locale]/learning-paths/[pathId]/

## Responsibility

Learning path detail page — ordered lesson list with progress tracking and path description.

## Integration

- Uses `getPathByIdFromBundle` + `getLessonsForPath` from `src/lib/`
- Lesson cards show completion status via `useProgress` hook
