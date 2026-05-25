# Health Made Clear

Free, accessible health education in plain language. Learn about medications, doctor visits, lab results, and more.

## Requirements

- Node.js 18+
- npm 9+

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint (Next.js) |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E smoke tests (Playwright) |

## Editing content

| Content | Location |
|---------|----------|
| Lessons (English) | [`src/data/lessons.ts`](src/data/lessons.ts) |
| Learning paths | [`src/data/learningPaths.ts`](src/data/learningPaths.ts) |
| Glossary | [`src/data/glossary.ts`](src/data/glossary.ts) |
| Spanish lesson/path/glossary copy | [`src/lib/localizedContent.ts`](src/lib/localizedContent.ts) |
| UI strings (EN/ES) | [`src/messages/en.json`](src/messages/en.json), [`src/messages/es.json`](src/messages/es.json) |

## Environment variables

This app runs fully client-side for preferences and progress (localStorage). No secrets are required for local development.

Optional:

- `NEXT_PUBLIC_SITE_URL` — canonical site URL for sitemap/metadata (e.g. `https://healthmadeclear.example`)

Copy [`.env.example`](.env.example) to `.env.local` if needed.

## Deployment

Build and deploy as a standard Next.js 14 app (Vercel, Netlify, or any Node host):

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_SITE_URL` in production for correct sitemap and Open Graph URLs.

## License

MIT — see [LICENSE](LICENSE).
