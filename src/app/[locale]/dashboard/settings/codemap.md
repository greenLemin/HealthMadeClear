# src/app/[locale]/dashboard/settings/

## Responsibility

User settings page — profile display name, progress export/import.

## Integration

- Progress export: serializes localStorage state to downloadable JSON
- Progress import: parses JSON and writes to localStorage
- Uses `src/lib/progressExport.ts`
