# src/lib/lessons/

## Responsibility

Lesson data loading and MDX parsing for the build pipeline.

## Key Files

- `loadLessons.ts`: Runtime lesson access — `getAllLessons`, `getLessonByIdFromBundle` from bundled data. Includes `loadLessonsForLocale` dynamic import for code splitting.
- `mdxParser.ts`: Build-time MDX parsing — reads lesson MDX files from `content/lessons/{locale}/`, parses frontmatter with gray-matter, extracts sections and callouts via regex. Used by bundle scripts.

## Integration

- Loaders consumed by: All page components via `src/lib/content.ts` facade
- Parser consumed by: `scripts/bundle-lessons.ts`
- Depends on: `src/data/lessonBundles.ts`, `src/types/lesson.ts`, `gray-matter`
