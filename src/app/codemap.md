# src/app/

## Responsibility

Next.js App Router root — global layout, fonts, CSS, sitemap, robots, error boundary.

## Key Files

- `layout.tsx`: Minimal root layout — passes children through (actual layout in `[locale]/layout.tsx`)
- `globals.css`: Tailwind CSS base with custom design tokens (surface, primary, on-surface, etc.)
- `fonts.ts`: Atkinson Hyperlegible font configuration (variable font for accessibility)
- `global-error.tsx`: Top-level error boundary (catches render errors in production)
- `not-found.tsx`: 404 page (locale-unaware fallback)
- `robots.ts`: Dynamic robots.txt generation
- `sitemap.ts`: Dynamic sitemap.xml generation (all locales x all routes)

## Integration

- Consumed by: Next.js framework. `layout.tsx` wraps all routes.
- Depends on: `[locale]/` for actual page content, `fonts.ts` for font loading
