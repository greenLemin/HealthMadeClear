# src/lib/quizzes/

## Responsibility

Quiz MDX parsing for the build pipeline.

## Key Files

- `quizParser.ts`: Build-time MDX parsing — reads quiz MDX from `content/quizzes/{locale}/`. Parses questions, options (A/B/C/D), correct answers, and explanations using regex patterns. Handles bilingual "Question"/"Pregunta" headings.

## Integration

- Consumed by: `scripts/bundle-quizzes.ts`
- Depends on: `src/types/quiz.ts`, `gray-matter`
