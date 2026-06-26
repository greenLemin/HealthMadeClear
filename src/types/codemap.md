# src/types/

## Responsibility

TypeScript type definitions for all domain entities and database schema.

## Key Files

- `content.ts`: Content ID constants and category types — `LESSON_IDS`, `PATH_IDS`, `GLOSSARY_IDS`, `ARTICLE_IDS`, `LessonCategoryId`
- `lesson.ts`: `Lesson` and `LessonListItem` interfaces
- `quiz.ts`: `Quiz` and `QuizQuestion` interfaces
- `learningPath.ts`: `LearningPath` interface
- `article.ts`: `Article` interface
- `glossary.ts`: `GlossaryTerm` interface
- `database.ts`: Supabase `Database` schema type — all table Row/Insert/Update types (profiles, lesson_progress, quiz_attempts, achievements, streaks, daily_log, notifications)

## Integration

- Consumed by: All src/lib, src/components, src/app, and data files
- Depends on: No internal deps (pure type definitions)
