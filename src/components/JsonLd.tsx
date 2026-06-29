import Script from "next/script";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
};

export default function JsonLd({ data, id = "hmc-jsonld" }: JsonLdProps) {
  // Sanitize payload before injecting it as JSON-LD script content.
  const jsonLdData = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return <Script id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdData }} />;
}
