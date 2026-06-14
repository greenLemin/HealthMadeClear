import serialize from "serialize-javascript";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Serialize JSON-LD data safely — escapes potentially dangerous characters to prevent XSS injection. */
function safeJsonLd(data: unknown): string {
  return serialize(data, { isJSON: true });
}

export default function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
