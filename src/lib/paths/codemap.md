# src/lib/paths/

## Responsibility

Learning path data loading and MDX parsing.

## Key Files

- `loadPaths.ts`: Runtime path access — `getAllLearningPaths`, `getPathByIdFromBundle` from bundled data
- `mdxParser.ts`: Build-time MDX parsing — reads path MDX from `content/paths/{locale}/`, parses frontmatter, extracts lesson references and content sections

## Integration

- Loaders consumed by: Page components via `src/lib/content.ts`
- Parser consumed by: `scripts/bundle-paths.ts`
- Depends on: `src/data/pathBundles.ts`, `src/types/learningPath.ts`
