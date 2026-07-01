import Script from "next/script";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
};

export default function JsonLd({ data, id = "hmc-jsonld" }: JsonLdProps) {
  // Escape strictly to prevent XSS. We don't need a full library because the JSON serializer
  // guarantees the structure, and these replacements just neutralize HTML entities and line terminators.
  const jsonLdData = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  // React natively renders children of <script> and <style> tags without HTML encoding them
  // (i.e. it acts like dangerouslySetInnerHTML internally but it's safer and more idiomatic).
  // This effectively puts the sanitized JSON string directly into the script tag.
  return (
    <Script id={id} type="application/ld+json">
      {jsonLdData}
    </Script>
  );
}
