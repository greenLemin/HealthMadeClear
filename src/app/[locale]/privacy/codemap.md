# src/app/[locale]/privacy/

## Responsibility

Privacy policy page.

## Key Files

- `page.tsx`: Sets locale and mounts `PrivacyClient`
- `PrivacyClient.tsx`: Policy renderer (collect paragraphs, account/contact retention, controls)

## Integration

- Catalog keys under `privacy.*` in `src/messages/{en,es}.json`
