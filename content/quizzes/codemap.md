# content/quizzes/

## Responsibility

Quiz source MDX files in EN and ES locales.

## Structure

Each file: `content/quizzes/{locale}/{lessonId}.mdx` with frontmatter (id, title, lessonId, passScore) and markdown body with `## Question/Pregunta N` headings, A/B/C/D options, answer, and explanation.

## Integration

- Consumed by: `scripts/bundle-quizzes.ts`
- Parsed by: `src/lib/quizzes/quizParser.ts`
