type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JsonLd({ data }: JsonLdProps) {
  // Serialize JSON-LD safely. We must use dangerouslySetInnerHTML to prevent React from HTML-encoding
  // the double quotes (which would break JSON parsing) while avoiding XSS.
  const jsonLdData = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdData }} />;
}
