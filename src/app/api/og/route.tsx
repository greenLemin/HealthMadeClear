import { ImageResponse } from "next/og";

export const runtime = "edge";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap";

let fontCache: Promise<ArrayBuffer> | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;

  fontCache = (async () => {
    try {
      const css = await fetch(FONT_URL, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      }).then((r) => r.text());

      const urlMatch = css.match(/url\(([^)]+)\)/);
      if (!urlMatch) {
        const fallback = await fetch(
          "https://fonts.gstatic.com/s/atkinsonhyperlegible/v11/9Bt23C1KxNDXMspQ1lPyU89-1h6ONRlW45GE5Zg.woff2"
        );
        return fallback.arrayBuffer();
      }

      const fontUrl = urlMatch[1].replace(/['"]/g, "");
      const font = await fetch(fontUrl);
      return font.arrayBuffer();
    } catch (e) {
      fontCache = null;
      throw e;
    }
  })();

  return fontCache;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Health Education for Everyone";
  const category = searchParams.get("category") || "";

  const fontData = await loadFont();

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "#004349",
        padding: "80px 100px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: 700,
            color: "#FFFFFF",
            fontFamily: "'Atkinson Hyperlegible'",
          }}
        >
          H
        </div>
        <span
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#FFFFFF",
            opacity: 0.9,
            fontFamily: "'Atkinson Hyperlegible'",
            letterSpacing: "-0.02em",
          }}
        >
          Health Made Clear
        </span>
      </div>

      <h1
        style={{
          fontSize: "64px",
          fontWeight: 700,
          color: "#FFFFFF",
          lineHeight: 1.2,
          maxWidth: "900px",
          fontFamily: "'Atkinson Hyperlegible'",
          margin: 0,
          padding: 0,
        }}
      >
        {title}
      </h1>

      {category ? (
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.8)",
              fontFamily: "'Atkinson Hyperlegible'",
              background: "rgba(255,255,255,0.1)",
              padding: "8px 20px",
              borderRadius: "100px",
            }}
          >
            {category}
          </span>
        </div>
      ) : null}
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Atkinson Hyperlegible",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
