/**
 * Heading/TOC fragment id. Duplicate titles get `-2`, `-3`, … when `used` is passed.
 * Empty or punctuation-only titles become `section`.
 */
export function slugify(text: string, used?: Set<string>): string {
  const base =
    text
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";

  if (!used) return base;

  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let n = 2;
  let candidate = `${base}-${n}`;
  while (used.has(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  used.add(candidate);
  return candidate;
}
