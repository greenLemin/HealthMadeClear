import { describe, expect, it } from "vitest";
import { getAllPathsFromMdx } from "@/lib/paths/mdxParser";

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
