import Script from "next/script";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
};

function isPlainJsonValue(value: unknown, seen: WeakSet<object> = new WeakSet()): boolean {
  if (value === null) return true;
  if (typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.every((item) => isPlainJsonValue(item, seen));
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return false;
  return Object.values(value as Record<string, unknown>).every((item) => isPlainJsonValue(item, seen));
}

function serializeJsonLd(data: unknown): string {
  if (data === null || typeof data !== "object" || !isPlainJsonValue(data)) {
    throw new Error("JsonLd data must be a JSON-serializable plain object or array");
  }
  let plain: unknown;
  try {
    plain = JSON.parse(JSON.stringify(data)) as unknown;
  } catch {
    throw new Error("JsonLd data must be a JSON-serializable plain object or array");
  }
  if (plain === null || typeof plain !== "object") {
    throw new Error("JsonLd data must be a JSON-serializable plain object or array");
  }

  // Escape strictly to prevent XSS. We don't need a full library because the JSON serializer
  // guarantees the structure, and these replacements just neutralize HTML entities and line terminators.
  return JSON.stringify(plain)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export default function JsonLd({ data, id = "hmc-jsonld" }: JsonLdProps) {
  const jsonLdData = serializeJsonLd(data);

  // React natively renders children of <script> and <style> tags without HTML encoding them
  // (i.e. it acts like dangerouslySetInnerHTML internally but it's safer and more idiomatic).
  // This effectively puts the sanitized JSON string directly into the script tag.
  return (
    <Script id={id} type="application/ld+json">
      {jsonLdData}
    </Script>
  );
}
