/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    expect(innerHTML).toContain("\\u003c\\u002fscript\\u003e"); // </script>
    expect(innerHTML).toContain("\\u003cscript\\u003e"); // <script>
    expect(innerHTML).toContain("XSS \\u0026 co"); // &
    expect(innerHTML).toContain("\\u0027"); // '
    expect(innerHTML).toContain("\\u2028"); // \u2028
    expect(innerHTML).toContain("\\u2029"); // \u2029
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
