# src/lib/articles/

## Responsibility

Article data loading and MDX parsing.

## Key Files

- `loadArticles.ts`: Runtime article access — `getAllArticles`, `getArticleByIdFromBundle`, `loadArticlesForLocale` (dynamic import for code splitting)
- `mdxParser.ts`: Build-time MDX parsing — reads article MDX from `content/articles/{locale}/`, parses frontmatter and sections

## Integration

- Loaders consumed by: Article page components via `src/lib/content.ts`
- Parser consumed by: `scripts/bundle-articles.ts`
- Depends on: `src/data/articleBundles.ts`, `src/types/article.ts`
