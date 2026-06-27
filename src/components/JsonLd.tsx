type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JsonLd({ data }: JsonLdProps) {
  // Serialize JSON-LD safely. We avoid dangerouslySetInnerHTML to prevent XSS.
  // React safely treats `<script>` tags as raw text elements without HTML-encoding double quotes.
  const jsonLdData = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return <script type="application/ld+json">{jsonLdData}</script>;
}
