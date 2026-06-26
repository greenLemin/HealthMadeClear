# src/app/[locale]/learn/

## Responsibility

Lesson catalog page — lists all lessons with category/difficulty filtering.

## Key Files

- `page.tsx`: Lesson catalog with filterable grid of LessonCards

## Integration

- Loads lessons via `getAllLessons` from `src/lib/lessons/loadLessons.ts`
- Links to `/learn/[slug]` for individual lesson pages
