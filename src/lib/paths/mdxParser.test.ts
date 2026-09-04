import { describe, expect, it, vi, afterEach } from "vitest";
import { getAllPathsFromMdx, getPathMdxDir } from "@/lib/paths/mdxParser";
import fs from "fs";
import path from "path";

describe("paths mdxParser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads all English paths from MDX", async () => {
    const paths = await getAllPathsFromMdx("en");
    expect(paths).toHaveLength(7);
    expect(paths[0]?.lessons.length).toBeGreaterThan(0);
  });

  it("loads Spanish path with translated title", async () => {
    const paths = await getAllPathsFromMdx("es");
    const p = paths.find((p) => p.id === "safer-medicine-use");
    expect(p?.title).toBe("Uso más seguro de medicamentos");
  });

  it("throws an error when a path MDX file is missing", async () => {
    vi.spyOn(fs.promises, "access").mockRejectedValueOnce(new Error("ENOENT"));
    await expect(getAllPathsFromMdx("en")).rejects.toThrow(/Missing path MDX file:/);
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
