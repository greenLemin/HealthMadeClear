# Contributing to Health Made Clear

Thank you for helping make health education clearer and more accessible.

## Development setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).

## Before you open a PR

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Editing lesson, path, or glossary content

1. Edit MDX under `content/lessons/{en,es}/`, `content/paths/{en,es}/`, or `content/glossary/{en,es}/`.
2. Keep **matching IDs/slugs** across English and Spanish files.
3. Run `npm run content:bundle` (or `npm run build`, which bundles automatically).
4. Commit the updated generated files in `src/data/*Bundles.ts`.

See [docs/CONTENT.md](docs/CONTENT.md) for frontmatter and callout syntax.

## Editing UI strings

Update both [`src/messages/en.json`](src/messages/en.json) and [`src/messages/es.json`](src/messages/es.json) with the same keys.

## Locales and routing

- Supported locales: `en`, `es` (configured in [`src/i18n/routing.ts`](src/i18n/routing.ts)).
- All user-facing routes live under `/[locale]/...`.

## Design tokens

Visual tokens are documented in [`DESIGN.md`](DESIGN.md). Reference exports live in `stitch_health_made_clear_ux_design/`; runtime assets are under `public/stitch/`.

## Code style

- TypeScript strict mode; avoid `any`.
- Prefer existing patterns: server `page.tsx` + client `*Client.tsx`.
- Match accessibility patterns in `Header`, `AccessibilityControls`, and `useFocusTrap`.
