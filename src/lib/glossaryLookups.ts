const GLOSSARY_LOOKUPS_KEY = "hmc-glossary-lookups";
const MAX_STORED_LOOKUPS = 20;

/**
 * Records a unique glossary term lookup in localStorage.
 * Capped at 20 unique term IDs.
 * Returns the current total count of unique lookups.
 */
export function recordGlossaryLookup(termId: string): number {
  if (typeof window === "undefined" || !termId) {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(GLOSSARY_LOOKUPS_KEY);
    let items: string[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        items = parsed.filter((id): id is string => typeof id === "string");
      }
    }

    if (!items.includes(termId)) {
      items.push(termId);
      if (items.length > MAX_STORED_LOOKUPS) {
        items = items.slice(-MAX_STORED_LOOKUPS);
      }
      window.localStorage.setItem(GLOSSARY_LOOKUPS_KEY, JSON.stringify(items));
    }

    return items.length;
  } catch {
    return 0;
  }
}

/**
 * Returns the count of unique glossary terms looked up in localStorage.
 */
export function getGlossaryLookupCount(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(GLOSSARY_LOOKUPS_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter to strings for consistency with recordGlossaryLookup, which
      // strips non-string entries. Prevents a manually-edited array like
      // [1, null, {}] from inflating the count.
      return parsed.filter((id): id is string => typeof id === "string").length;
    }
    return 0;
  } catch {
    return 0;
  }
}
