import { describe, expect, it } from "vitest";
import { buildProgressExport, parseProgressImport } from "@/lib/progressExport";

describe("progressExport", () => {
  it("builds and parses export payload", () => {
    const payload = buildProgressExport(["a"], ["b"], ["c"]);
    expect(payload.version).toBe(2);
    expect(payload.quizScores).toEqual([]);
    const parsed = parseProgressImport(JSON.stringify(payload));
    expect(parsed?.completedLessons).toEqual(["a"]);
    expect(parsed?.recentLessons).toEqual(["b"]);
    expect(parsed?.startedPaths).toEqual(["c"]);
  });

  it("rejects invalid import", () => {
    expect(parseProgressImport("{}")).toBeNull();
  });

  it("imports legacy v1 exports without quiz scores", () => {
    const legacy = {
      version: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      completedLessons: ["a"],
      recentLessons: ["b"],
      startedPaths: ["c"],
    };
    const parsed = parseProgressImport(JSON.stringify(legacy));
    expect(parsed?.version).toBe(2);
    expect(parsed?.quizScores).toEqual([]);
  });
});
