# src/app/[locale]/learning-paths/

## Responsibility

Learning path catalog and detail pages.

## Sub-routes

- `page.tsx`: Path catalog — lists all learning paths
- `[pathId]/page.tsx`: Path detail — lesson sequence with progress tracking

## Integration

- Loads paths via `src/lib/paths/loadPaths.ts`
- Links to individual lessons within each path
- Client-side progress indicators per path
