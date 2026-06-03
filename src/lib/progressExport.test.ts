import { describe, expect, it } from "vitest";
import { buildProgressExport, parseProgressImport } from "@/lib/progressExport";

describe("progressExport", () => {
  it("builds and parses export payload", () => {
    const payload = buildProgressExport(["a"], ["b"], ["c"]);
    expect(payload.version).toBe(1);
    const parsed = parseProgressImport(JSON.stringify(payload));
    expect(parsed?.completedLessons).toEqual(["a"]);
    expect(parsed?.recentLessons).toEqual(["b"]);
    expect(parsed?.startedPaths).toEqual(["c"]);
  });

  it("rejects invalid import", () => {
    expect(parseProgressImport("{}")).toBeNull();
  });
});
