# Content authoring

## Lessons

Path: `content/lessons/{en,es}/{id}.mdx`

Required frontmatter:

- `id`, `title`, `description`, `category`, `categoryId`, `duration`, `level`

Optional:

- `lastReviewed` (ISO date string)
- `sources` (array of strings)
- `image` (public path, e.g. `/stitch/lesson_example.png`)

Body uses `## Section title` headings. Callouts:

```
:::info
Helpful note text.
:::

:::warning
Safety warning text.
:::

:::success
Positive reinforcement text.
:::
```

## Learning paths

Path: `content/paths/{en,es}/{id}.mdx`

## Glossary

Path: `content/glossary/{en,es}/{id}.mdx`

## After editing

```bash
npm run content:bundle
npm run content:validate
```

English and Spanish files must share the same `id` values per content type.
