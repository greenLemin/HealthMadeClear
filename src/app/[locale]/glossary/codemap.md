# src/app/[locale]/glossary/

## Responsibility

Glossary index and term detail pages.

## Sub-routes

- `page.tsx`: Glossary index — alphabetically grouped terms with search
- `[term]/page.tsx`: Term detail — definition, related terms, related lessons

## Integration

- Loads terms via `src/lib/glossary/loadGlossary.ts`
- Client-side search filtering
- Related lesson links cross-reference to learn pages
