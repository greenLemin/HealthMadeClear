# src/app/[locale]/learn/[slug]/quiz/

## Responsibility

Lesson quiz page — interactive multiple-choice quiz with scoring.

## Integration

- Loads quiz via `getQuizByLessonId` from `src/lib/localizedQuiz.ts`
- Quiz components handle question navigation, answer selection, scoring
- Records results via `useProgress` hook
