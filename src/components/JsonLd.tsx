type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Serialize JSON-LD data safely — escapes `</script>` to prevent XSS injection. */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
