# Content Authoring Guidelines

Rules enforced by `scripts/validate-content.ts` during `npm run content:bundle`. Run validation locally before committing MDX changes.

---

## Locale Parity

Every content ID must exist in **both** `content/en/` and `content/es/`:

- Lessons
- Learning paths
- Glossary terms
- Quizzes
- Articles

Missing translations fail the build.

---

## Lessons & Articles

### Required frontmatter

- `title` — non-empty
- `description` — non-empty
- `lastReviewed` — ISO date (`YYYY-MM-DD`), required for clinical review workflow

### Body requirements

- At least one content section
- `lastReviewed` must be a valid date **within the last 12 months** — older dates fail validation and require re-review

---

## Quizzes

- `title` required
- Minimum **5 questions** per quiz
- Each question needs an `explanation` of at least **40 characters**
- Placeholder explanations ending in ` — correct.` are rejected

---

## Clinical Review Workflow

When updating lesson or article content:

1. Update the MDX body
2. Set `lastReviewed` to today's date in frontmatter
3. Mirror the change in the other locale
4. Run `npm run content:validate` (or full `npm run content:bundle`)

---

## Validation Command

```bash
npm run content:validate
```

Fix all reported errors before opening a PR. Validation runs automatically in the prebuild step.
