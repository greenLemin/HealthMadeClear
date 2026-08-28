# VERIFY-PHASE-14 — analyzer evidence (§17.2 step 5 / §17.4 client chunk)

**§17.4 client-chunk checkbox: PASS**

`/en/learn/[slug]` required client JS does not parse `lessonBundles.es` or `pathBundles.es`. Lesson ES is absent from the whole client compilation. Path ES is a non-initial async chunk loaded only when `locale === "es"`.

No generator / loader changes. Analyzer did not show dual-locale lesson+path content inlined into the EN learn-slug graph.

---

## Command

```bash
OPEN_ANALYZER=false ANALYZE=true NODE_OPTIONS='--max-old-space-size=8192' npm run analyze
```

(`package.json`: `"analyze": "ANALYZE=true next build --webpack"`.)

Tiny config so the run does not open a browser or clobber a live `next dev` `.next`:

- `next.config.mjs`: `openAnalyzer: process.env.OPEN_ANALYZER === "true"`; `distDir: ".next-analyze"` when `ANALYZE=true`
- `.gitignore`: `.next-analyze/`

Next.js rewrote `tsconfig.json` include for `.next-analyze/types` during the build; that rewrite was reverted and is **not** staged.

Elapsed: ~28s. 363 pages generated. Analyzer wrote static HTML (did not hang).

---

## Reports (not committed)

| File                                | Size | Role                         |
| ----------------------------------- | ---- | ---------------------------- |
| `.next-analyze/analyze/client.html` | 834K | webpack client graph         |
| `.next-analyze/analyze/nodejs.html` | 907K | server / SSG graph           |
| `.next-analyze/analyze/edge.html`   | 349K | edge; no path/lesson bundles |

---

## Module-name grep (`rg -F`)

| Needle             | `client.html` | `nodejs.html` | `edge.html` |
| ------------------ | ------------- | ------------- | ----------- |
| `lessonBundles.es` | **0**         | 2             | 0           |
| `lessonBundles.en` | **0**         | 2             | 0           |
| `pathBundles.es`   | 2             | 10            | 0           |
| `pathBundles.en`   | 2             | 10            | 0           |

Client analyzer placements (`isInitialByEntrypoint: {}` = not an eager entry chunk):

- `./src/data/pathBundles.es.ts` → `static/chunks/6982.b34c2bb8924bdc20.js` (parsed 6.0K)
- `./src/data/pathBundles.en.ts` → `static/chunks/6725.57b0a3cbe918dec2.js` (parsed 6.3K)
- `lessonBundles.es.ts` / `.en.ts`: **not present** in `client.html`

Server (`nodejs.html`) still has both lesson locales — expected; `getAllLessons` stays sync for SSG.

---

## `/en/learn/[slug]` required client chunks

From `LessonPageClient` + `[locale]` layout in `.next-analyze/server/app/[locale]/learn/[slug]/page_client-reference-manifest.js`.

Page: `static/chunks/app/[locale]/learn/[slug]/page-2d3981b7ca1dfd1d.js`  
Layout: `static/chunks/app/[locale]/layout-0516104b032929ca.js`  
Shared (incl. `pathsCache`): `static/chunks/9580-3c6376edd30ae862.js` plus vendor/layout helpers (`44530001-…`, `8500-…`, `1697-…`, `5-…`, `2305-…`, `5541-…`, `5271-…`, `6408-…`, `7205-…`, `3710-…`, `4575-…`, `6620-…`, `6011-…`).

**Not** in that required list: `6982…` (`pathBundles.es`), `6725…` (`pathBundles.en`), `9474…` (`searchIndex.es`).

Distinctive strings in those required files: **zero** hits for

- `Nunca tomes más de la cantidad indicada` (lesson ES callout, not in `searchIndex.es`)
- `Nunca comparta medicamentos recetados` (path ES-only callout)
- `lessonBundles.es` / `pathBundles.es`

`9580-3c6376edd30ae862.js` is the locale switch only (no ES path body):

```js
return "es" === e
  ? (await r.e(6982).then(r.bind(r, 56982))).paths
  : (await r.e(6725).then(r.bind(r, 56725))).paths;
```

EN completion loads chunk **6725** (`Safer Medicine Use`). ES loads **6982** (`Nunca comparta medicamentos recetados`; title stored as `Uso m\xe1s seguro de medicamentos`).

`9474.54309be2c3cad8ab.js` contains `Entender las etiquetas de receta` because it **is** `searchIndex.es` (`n.d(a,{searchIndex:…})`), lazy from `SearchDialog` — out of this checkbox; §17.4 still requires `searchIndex.${locale}` lazy load.

---

## Checkbox

- [x] Client graph for `/en/learn/[slug]` does not include `lessonBundles.es` **or** `pathBundles.es` (`ANALYZE=true npm run analyze` evidence on the PR).
