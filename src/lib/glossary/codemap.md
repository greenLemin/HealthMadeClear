# src/lib/glossary/

## Responsibility

Glossary term loading, MDX parsing, and inline highlighter cache.

## Key Files

- `loadGlossary.ts`: Runtime glossary access — `getAllGlossaryTerms`, `getGlossaryTermById`, `getGlossaryLabelFromBundle`
- `mdxParser.ts`: Build-time MDX parsing — reads glossary MDX from `content/glossary/{locale}/`, parses frontmatter with related terms and lessons
- `highlighterCache.ts`: Caches glossary term data for client-side inline highlighting in lesson/article content

## Integration

- Loaders consumed by: Glossary page components, GlossaryHighlighter MDX component
- Parser consumed by: `scripts/bundle-glossary.ts`
- Depends on: `src/data/glossaryBundles.ts`, `src/types/glossary.ts`
