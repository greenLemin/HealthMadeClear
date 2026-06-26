# content/

## Responsibility

Source content in MDX format — the single source of truth for all educational content.

## Structure

```
content/
  lessons/en/*.mdx     — 36 lesson files (EN)
  lessons/es/*.mdx     — 36 lesson files (ES)
  paths/en/*.mdx       — 7 learning path files (EN)
  paths/es/*.mdx       — 7 learning path files (ES)
  quizzes/en/*.mdx     — Quiz files per lesson (EN)
  quizzes/es/*.mdx     — Quiz files per lesson (ES)
  articles/en/*.mdx    — 15 article files (EN)
  articles/es/*.mdx    — 15 article files (ES)
  glossary/en/*.mdx    — 31 glossary term files (EN)
  glossary/es/*.mdx    — 31 glossary term files (ES)
```

## Frontier Matter Schema

Each MDX file contains YAML frontmatter (gray-matter) with content-specific fields (id, title, description, category, level, etc.) plus markdown body.

## Data Flow

1. Source MDX -> bundle scripts -> TypeScript data files -> runtime loaders

## Integration

- Consumed by: `scripts/bundle-*.ts` scripts
- References: Content IDs are defined in `src/types/content.ts`
