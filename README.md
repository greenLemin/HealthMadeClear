# Health Made Clear

Free, accessible health education in plain language. Learn about medications, doctor visits, lab results, and more.

## Requirements

- Node.js 20+
- npm 9+

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en) (or `/es` for Spanish). Visiting `/` redirects to your preferred locale.

## Scripts

| Command                           | Description                                                              |
| --------------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`                     | Start development server                                                 |
| `npm run build`                   | Production build                                                         |
| `npm run start`                   | Run production server                                                    |
| `npm run lint`                    | ESLint (Next.js)                                                         |
| `npm run typecheck`               | TypeScript check                                                         |
| `npm test`                        | Unit tests (Vitest)                                                      |
| `npm run test:e2e`                | E2E smoke tests (Playwright)                                             |
| `npm run content:bundle`          | Rebuild all content bundles from MDX (runs automatically before `build`) |
| `npm run content:bundle-lessons`  | Rebuild lessons only                                                     |
| `npm run content:bundle-paths`    | Rebuild learning paths only                                              |
| `npm run content:bundle-glossary` | Rebuild glossary only                                                    |

## Design

UI tokens and color system: [`DESIGN.md`](DESIGN.md). Stitch reference exports are in `stitch_health_made_clear_ux_design/`; shipped images live in `public/stitch/`.

## Editing content

Edit the MDX files below, then run `npm run content:bundle` (or `npm run build`).

| Content            | Location                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Lessons            | [`content/lessons/{en,es}/*.mdx`](content/lessons/en/)                                         |
| Learning paths     | [`content/paths/{en,es}/*.mdx`](content/paths/en/)                                             |
| Glossary           | [`content/glossary/{en,es}/*.mdx`](content/glossary/en/)                                       |
| UI strings (EN/ES) | [`src/messages/en.json`](src/messages/en.json), [`src/messages/es.json`](src/messages/es.json) |

## Environment variables

This app runs fully client-side for preferences and progress (localStorage). No secrets are required for local development.

Optional:

- `NEXT_PUBLIC_SITE_URL` — canonical site URL for sitemap/metadata (e.g. `https://healthmadeclear.example`)

Copy [`.env.example`](.env.example) to `.env.local` if needed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Deployment

Build and deploy as a standard Next.js 14 app (Vercel, Netlify, or any Node host):

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_SITE_URL` in production for correct sitemap and Open Graph URLs.

## License

MIT — see [LICENSE](LICENSE).
