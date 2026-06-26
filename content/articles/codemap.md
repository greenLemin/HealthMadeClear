# content/articles/

## Responsibility

Article source MDX files in EN and ES locales.

## Structure

Each file: `content/articles/{locale}/{articleId}.mdx` with frontmatter (id, title, description, category, readingTime, sources) and markdown body with sections.

## Integration

- Consumed by: `scripts/bundle-articles.ts`
- Parsed by: `src/lib/articles/mdxParser.ts`
