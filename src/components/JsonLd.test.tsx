/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  default: ({ children, ...props }: any) => <script {...props}>{children}</script>,
}));

import JsonLd from "./JsonLd";

describe("JsonLd", () => {
  it("renders a script tag with application/ld+json", () => {
    const data = { "@context": "https://schema.org", "@type": "WebSite", name: "My Site" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector("script");
    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute("type", "application/ld+json");

    const parsedData = JSON.parse(script?.innerHTML || "{}");
    expect(parsedData["@type"]).toBe("WebSite");
    expect(parsedData.name).toBe("My Site");
  });

  it("uses custom script id if provided", () => {
    const data = { "@type": "WebSite" };
    const { container } = render(<JsonLd data={data} id="custom-jsonld-id" />);
    const script = container.querySelector("#custom-jsonld-id");
    expect(script).toBeInTheDocument();
  });

  it("safely escapes characters that could lead to XSS", () => {
    const dangerousData = {
      malicious: "</script><script>alert('XSS & co')</script>",
      lineTerminators: "line1\u2028line2\u2029",
    };
    const { container } = render(<JsonLd data={dangerousData} />);
    const script = container.querySelector("script");

    // The rendered HTML shouldn't contain literal potentially dangerous characters inside the JSON string values
    const innerHTML = script?.innerHTML || "";

    // Test that literal `<` and `>` are escaped
    expect(innerHTML).not.toContain("</script>");
    expect(innerHTML).not.toContain("<script>");

    // Check specific unicode hex escapes are used
    expect(innerHTML.toLowerCase()).toContain("\\u003c\\u002fscript\\u003e"); // </script>
    expect(innerHTML.toLowerCase()).toContain("\\u003cscript\\u003e"); // <script>
    expect(innerHTML).toContain("XSS & co"); // &
    expect(innerHTML).toContain("'"); // '
    expect(innerHTML).toContain("\\u2028"); // \u2028
    expect(innerHTML).toContain("\\u2029"); // \u2029
  });

  it("rejects non-plain objects and invalid values", () => {
    expect(() => render(<JsonLd data={new Date() as unknown as Record<string, unknown>} />)).toThrow(
      /plain object or array/
    );

    class Payload {
      name = "not-plain";
    }
    expect(() => render(<JsonLd data={new Payload() as unknown as Record<string, unknown>} />)).toThrow(
      /plain object or array/
    );

    const circular: Record<string, unknown> = { ok: true };
    circular.self = circular;
    expect(() => render(<JsonLd data={circular} />)).toThrow(/plain object or array/);

    expect(() => render(<JsonLd data={null as unknown as Record<string, unknown>} />)).toThrow(
      /plain object or array/
    );

    expect(() => render(<JsonLd data={{ invalidNum: NaN } as unknown as Record<string, unknown>} />)).toThrow(
      /plain object or array/
    );

    expect(() =>
      render(<JsonLd data={{ invalidFn: () => {} } as unknown as Record<string, unknown>} />)
    ).toThrow(/plain object or array/);
  });

  it("accepts a nested plain object after JSON.parse(JSON.stringify(data))", () => {
    const data = { "@type": "WebSite", nested: { n: 1, flag: true, empty: null } };
    const { container } = render(<JsonLd data={data} />);
    const parsedData = JSON.parse(container.querySelector("script")?.innerHTML || "{}");
    expect(parsedData).toEqual(data);
  });

  it("remains valid JSON when parsed", () => {
    const dangerousData = {
      malicious: "</script><script>alert('XSS & co')</script>",
      lineTerminators: "line1\u2028line2\u2029",
    };
    const { container } = render(<JsonLd data={dangerousData} />);
    const script = container.querySelector("script");

    // The browser interprets the inner HTML as the raw JSON content
    const parsedData = JSON.parse(script?.innerHTML || "{}");

    expect(parsedData).toEqual(dangerousData);
  });
});
