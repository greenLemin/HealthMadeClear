# scripts/

## Responsibility

Content build pipeline — generates TypeScript data bundles from MDX source files, validates content, and patches content.

## Key Files

### Bundle Scripts (npm run content:bundle-\*)

- `bundle-lessons.ts`: Reads lesson MDX from `content/lessons/{locale}/`, parses with `lib/lessons/mdxParser.ts`, writes `src/data/lessonBundles.*.ts`
- `bundle-paths.ts`: Reads path MDX from `content/paths/{locale}/`, writes `src/data/pathBundles.*.ts`
- `bundle-glossary.ts`: Reads glossary MDX from `content/glossary/{locale}/`, writes `src/data/glossaryBundles.*.ts`
- `bundle-quizzes.ts`: Reads quiz MDX from `content/quizzes/{locale}/`, writes `src/data/quizBundles.*.ts`
- `bundle-articles.ts`: Reads article MDX from `content/articles/{locale}/`, writes `src/data/articleBundles.*.ts`
- `build-search-index.ts`: Builds client-side search index (`searchIndex.*.ts`)

### Generation Scripts (npm run content:generate-\*)

- `generate-lesson-mdx.ts`: Generates lesson MDX from structured data
- `generate-path-mdx.ts`: Generates path MDX
- `generate-glossary-mdx.ts`: Generates glossary MDX
- `generate-articles.ts`: Generates article MDX
- `generate-expansion-lessons.ts`: Generates expansion lesson content
- `enrich-glossary.ts`: Enriches glossary with additional context

### Validation & Patching

- `validate-content.ts`: Validates content integrity (all IDs, cross-references)
- `patch-*.ts`: Clinical review patches, lesson depth patches, path body patches, quiz explanation patches

### Other

- `check-production-env.mjs`: Verifies production environment variables before build
- `update_messages.js`: Updates translation message files

## Subdirectories

- `lib/validateLocaleParity.ts`: Validates locale parity between EN/ES content

## Data Flow

1. MDX source -> bundle script -> TypeScript bundle file -> `src/data/` -> runtime loaders

## Integration

- Consumed by: `src/data/` bundle files
- Depends on: `src/lib/*/mdxParser.ts` parsers, `gray-matter`, `tsx`
