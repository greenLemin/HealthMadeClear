# content/lessons/

## Responsibility

Lesson source MDX files in EN and ES locales.

## Structure

Each file: `content/lessons/{locale}/{lessonId}.mdx` with YAML frontmatter (id, title, description, category, categoryId, duration, level, image, sources) and markdown body with `##` section headings and `:::` callout blocks.

## Integration

- Consumed by: `scripts/bundle-lessons.ts`
- Parsed by: `src/lib/lessons/mdxParser.ts`
