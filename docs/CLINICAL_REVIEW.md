# Clinical Review Workflow

Health Made Clear content is educational, not personalized medical advice. Every lesson and article should be reviewed for accuracy, plain language, and appropriate emergency disclaimers before publication.

## Reviewer checklist

1. **Accuracy** — Facts align with current CDC, NIH, FDA, or specialty society guidance cited in `sources`.
2. **Plain language** — Reading level appropriate for general adults; jargon defined on first use.
3. **Safety** — Emergency symptoms direct users to call 911 or seek urgent care; no dangerous self-treatment advice.
4. **Scope** — Content does not diagnose, prescribe, or replace a clinician relationship.
5. **Equity** — Examples and guidance inclusive of diverse ages, backgrounds, and access contexts where relevant.
6. **Parity** — Spanish (`es`) content matches English meaning; idioms adapted, not machine-literal.

## Frontmatter fields

| Field          | Required                | Description                                             |
| -------------- | ----------------------- | ------------------------------------------------------- |
| `lastReviewed` | Yes (lessons, articles) | ISO date `YYYY-MM-DD` of last clinical review           |
| `sources`      | Yes (lessons)           | Authoritative references used                           |
| `reviewedBy`   | Recommended             | Reviewer name or role (e.g. `RN Health Education Team`) |

## Sign-off process

1. Author or editor updates MDX in `content/`.
2. Clinical reviewer completes checklist and sets `lastReviewed` + `reviewedBy`.
3. Run `npm run content:validate` locally (checks `lastReviewed` age).
4. CI runs the same validation on pull requests.

## Staleness policy

Content with `lastReviewed` older than **12 months** fails `content:validate`. Update medical facts, re-run review, and bump the date.

## What we do not store

No patient health information (PHI) in content files or user progress exports.
