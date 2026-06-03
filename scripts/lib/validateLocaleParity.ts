export function assertLocaleIdParity<T extends { id: string }>(en: T[], es: T[], label: string) {
  const enIds = new Set(en.map((item) => item.id));
  const esIds = new Set(es.map((item) => item.id));

  const missingInEs = Array.from(enIds).filter((id) => !esIds.has(id));
  const missingInEn = Array.from(esIds).filter((id) => !enIds.has(id));

  if (missingInEs.length > 0 || missingInEn.length > 0) {
    const details = [
      missingInEs.length ? `${label} missing in ES: ${missingInEs.join(", ")}` : "",
      missingInEn.length ? `${label} missing in EN: ${missingInEn.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("; ");
    throw new Error(details);
  }
}
