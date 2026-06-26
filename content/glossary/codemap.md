# content/glossary/

## Responsibility

Glossary term source MDX files in EN and ES locales.

## Structure

Each file: `content/glossary/{locale}/{glossaryId}.mdx` with frontmatter (id, term, category, relatedTerms, relatedLessons) and definition as markdown body.

## Integration

- Consumed by: `scripts/bundle-glossary.ts`
- Parsed by: `src/lib/glossary/mdxParser.ts`
