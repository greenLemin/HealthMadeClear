# VERIFY-PHASE-14

**Verdict: APPROVED**

Reviewer is not the Phase 14 author. Spec read from `REVAMP/PLAN.v10.md` §17.1–17.5 and the PHASE-14 COMPLETION REPORT ([P14 locale split](fc548982-53fa-4361-8124-5481f060a178)). Analyzer evidence from the implementer’s `ANALYZE=true` run (originally recorded in this file) was re-checked against the current loaders, `'use client'` import graph, and Playwright learn-title smoke.

All §17.4 product checkboxes pass. Combined barrels still exist for **server** SSG (`P14-2`); the contract was stop-**using** them from client, not stop-**emitting**. Mixed staging on `main` is the same tree-wide process note as P10/P11 — not a unique P14 product fail.

---

## Method

- **Spec**: `REVAMP/PLAN.v10.md` §17.1–17.5.
- **Diff**: bundle-*.ts, `bundle-locale-split.test.ts`, `loadPaths.ts`, `pathsCache.ts`, `lessons.ts`, `loadLessons.ts`, `localizedQuiz.ts`, `sideEffects.ts`, generated `*.en.ts` / `*.es.ts`, `lessonMeta.ts`.
- **Client import scan**: `'use client'` files do not import combined `lessonBundles` / `quizBundles` / `pathBundles` / `glossaryBundles`. Real client path load is `pathsCache.loadPathsForLocale` dynamic-importing one of `@/data/pathBundles.en` | `.es`.
- **Units**: loaders, `bundle-locale-split.test.ts`, `pathsCache`, `sideEffects`, `lessonMeta` — pass (in 956).
- **Playwright**: `/en/learn` and `/es/learn` H1 visible.
- **Analyzer**: implementer run `OPEN_ANALYZER=false ANALYZE=true npm run analyze` → `.next-analyze/analyze/client.html`. `next.config.mjs` gates `distDir: ".next-analyze"` on `ANALYZE=true`. This reviewer did not re-run the full analyzer (prior evidence + current import graph agree).

---

## Acceptance criteria (re-checked)

| Criterion                                                                        |  Result  | Evidence                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------- | :------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content:bundle` does not restore a client dual-locale barrel                    | **PASS** | Generators still emit combined barrels **with** “do not import from `'use client'`” banners. Guard: `scripts/bundle-locale-split.test.ts`. Client path is `pathsCache.ts:32-52` dynamic import of **one** locale. CI `git diff --exit-code` after bundle requires those generated files staged (they are).                             |
| `/en/learn/[slug]` client graph lacks `lessonBundles.es` **or** `pathBundles.es` | **PASS** | Analyzer `client.html`: `lessonBundles.es` **0**. `pathBundles.es` only in async chunk `6982…` with `isInitialByEntrypoint: {}`. Required JS for `/en/learn/[slug]` does not include 6982. Distinctive ES strings (`Nunca tomes más de la cantidad indicada`, `Nunca comparta medicamentos recetados`) absent from that required list. |
| All locales still SSG; `getAllLessons` remains sync                              | **PASS** | `loadLessons.ts:15-17` `export function getAllLessons` still sync. Callers in `page.tsx` / dashboard libs not converted to async. Dual static import of EN+ES in `loadLessons.ts:1-2` packs **server** (`nodejs.html`); not in client compilation.                                                                                     |
| Search still lazy-loads `searchIndex.${locale}`                                  | **PASS** | `SearchDialog.tsx:43` `import(\`@/data/searchIndex.${locale}.ts\`)`. Analyzer: `searchIndex.es` async chunk 9474, not in learn-slug required list.                                                                                                                                                                                     |
| Phase 7 `BEGINNER_LESSON_IDS`; `content:bundle` still emits `lessonMeta.ts`      | **PASS** | `sideEffects.ts` still imports `BEGINNER_LESSON_IDS` from `@/data/lessonMeta`. Bundle scripts still emit `lessonMeta.ts`.                                                                                                                                                                                                              |

---

## Analyzer evidence (implementer run; not re-executed)

Command:

```bash
OPEN_ANALYZER=false ANALYZE=true NODE_OPTIONS='--max-old-space-size=8192' npm run analyze
```

| Needle             |    `client.html`     | `nodejs.html` | `edge.html` |
| ------------------ | :------------------: | :-----------: | :---------: |
| `lessonBundles.es` |        **0**         |       2       |      0      |
| `lessonBundles.en` |        **0**         |       2       |      0      |
| `pathBundles.es`   | 2 (async chunk 6982) |      10       |      0      |
| `pathBundles.en`   | 2 (async chunk 6725) |      10       |      0      |

`9580-…js` locale switch only:

```js
return "es" === e
  ? (await r.e(6982).then(r.bind(r, 56982))).paths
  : (await r.e(6725).then(r.bind(r, 56725))).paths;
```

---

## Punch list

None that block APPROVED.

Logged follow-ups:

- Server leftover combined-barrel importers listed in `P14-2` now import locale files (`paths.ts`, `learningPaths.ts`, `glossary.ts`, `loadGlossary.ts`, `sitemap.ts`). `loadArticles.ts` also uses `.en` / `.es`. Combined barrels still exist as generator output (`P14-2`, done).
- `eslint.config.mjs` ignores `.next/**` and `.next-analyze/**`.
- Codemaps describe locale-split runtime imports (`P14-5`, done).

---

## What is actually correct (do not redo)

1. `pathsCache.ts` is the client path loader. Do not import `loadPaths.ts` from `'use client'`.
2. `lessons.ts` imports EN only for identical IDs / `generateStaticParams`.
3. `sideEffects` uses `loadPathsForLocale` + `BEGINNER_LESSON_IDS`, not `loadLessons`.
4. Analyzer `distDir` is gated: `isAnalyze = process.env.ANALYZE === "true"`.
