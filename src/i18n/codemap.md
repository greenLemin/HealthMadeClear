# src/i18n/

## Responsibility

Internationalization configuration for next-intl bilingual routing (EN/ES).

## Key Files

- `routing.ts`: Defines locales (`["en", "es"]`), default locale, and routing strategy (`localePrefix: "always"`)
- `request.ts`: next-intl request config — resolves locale from request, loads message catalog
- `navigation.ts`: Creates typed navigation helpers (`Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`) via `createNavigation`

## Integration

- Consumed by: `src/middleware.ts` (i18n routing), all components using `Link`, `useTranslations`, `usePathname`
- Depends on: `src/messages/{en,es}.json` for translation catalogs
