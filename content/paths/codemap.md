# content/paths/

## Responsibility

Learning path source MDX files in EN and ES locales.

## Structure

Each file: `content/paths/{locale}/{pathId}.mdx` with frontmatter (id, title, description, lessons[], duration, level, icon) and optional markdown body.

## Integration

- Consumed by: `scripts/bundle-paths.ts`
- Parsed by: `src/lib/paths/mdxParser.ts`
