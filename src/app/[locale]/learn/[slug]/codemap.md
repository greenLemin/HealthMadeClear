# src/app/[locale]/learn/[slug]/

## Responsibility

Individual lesson detail page — renders lesson content with sections, callouts, sidebar tips.

## Key Files

- `page.tsx`: Lesson detail — loads lesson by slug, renders MDX content, quiz link

## Integration

- Loads lesson via `getLessonById` from `src/lib/lessons/loadLessons.ts`
- Uses MDX components for rendering (GlossaryHighlighter, LessonCallout)
- Links to `quiz` sub-route for lesson quiz
- Depends on `useProgress` hook for marking lesson completion
