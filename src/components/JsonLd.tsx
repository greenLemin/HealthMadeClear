type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

const ESCAPE_ENTITIES: Record<string, string> = {
  '&': '\\u0026',
  '<': '\\u003c',
  '>': '\\u003e',
  "'": '\\u0027',
  '/': '\\u002f',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

/** Serialize JSON-LD data safely — escapes potentially dangerous characters to prevent XSS injection. */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/[&<>'\/\u2028\u2029]/g, (match) => ESCAPE_ENTITIES[match] as string);
}

export default function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
