import { describe, expect, it } from "vitest";
import { getAllPathsFromMdx, getPathMdxDir } from "@/lib/paths/mdxParser";
import path from "path";

describe("paths mdxParser", () => {
  it("loads all English paths from MDX", async () => {
    const paths = await getAllPathsFromMdx("en");
    expect(paths).toHaveLength(7);
    expect(paths[0]?.lessons.length).toBeGreaterThan(0);
  });

  it("loads Spanish path with translated title", async () => {
    const paths = await getAllPathsFromMdx("es");
    const path = paths.find((p) => p.id === "safer-medicine-use");
    expect(path?.title).toBe("Uso más seguro de medicamentos");
  });
});

describe("getPathMdxDir", () => {
  it("returns correct path for English locale", () => {
    const dir = getPathMdxDir("en");
    expect(dir).toBe(path.join(process.cwd(), "content", "paths", "en"));
  });

  it("returns correct path for Spanish locale", () => {
    const dir = getPathMdxDir("es");
    expect(dir).toBe(path.join(process.cwd(), "content", "paths", "es"));
  });
});
