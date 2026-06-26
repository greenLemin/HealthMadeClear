# src/app/[locale]/articles/

## Responsibility

Article catalog and detail pages.

## Sub-routes

- `page.tsx`: Article listing
- `[slug]/page.tsx`: Article detail with full content rendering

## Integration

- Loads articles via `src/lib/articles/loadArticles.ts`
- Uses MDX components for rendering
