// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  buildProgressExport,
  parseProgressImport,
  downloadProgressExport,
  applyProgressImport,
  readStoredQuizScores,
  type ExportedProgress,
} from "@/lib/progressExport";
import { STORAGE_KEYS } from "@/lib/preferences";

describe("progressExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("buildProgressExport and parseProgressImport", () => {
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

  describe("downloadProgressExport", () => {
    it("creates a blob and triggers a download", () => {
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      const mockRevokeObjectURL = vi.fn();

      vi.stubGlobal("URL", {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      });

      const mockAnchor = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as any);
      const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => {
        return null as any;
      });
      const removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => {
        return null as any;
      });

      const data = buildProgressExport(["a"], ["b"], ["c"]);
      downloadProgressExport(data);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(mockAnchor.href).toBe("blob:mock-url");
      expect(mockAnchor.download).toMatch(/^health-made-clear-progress-\d{4}-\d{2}-\d{2}\.json$/);
      expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("applyProgressImport", () => {
    it("saves imported data to localStorage", () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      const data: ExportedProgress = {
        version: 2,
        exportedAt: "2026-01-01T00:00:00.000Z",
        completedLessons: ["lesson-1"],
        recentLessons: ["lesson-2"],
        startedPaths: ["path-1"],
        quizScores: [
          { lessonId: "quiz-1", score: 100, passed: true, completedAt: "2026-01-01T00:00:00.000Z" },
        ],
      };

      applyProgressImport(data);

      expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEYS.completedLessons, JSON.stringify(["lesson-1"]));
      expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEYS.recentLessons, JSON.stringify(["lesson-2"]));
      expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEYS.startedPaths, JSON.stringify(["path-1"]));
      expect(setItemSpy).toHaveBeenCalledWith(
        STORAGE_KEYS.quizScores,
        JSON.stringify([
          { lessonId: "quiz-1", score: 100, passed: true, completedAt: "2026-01-01T00:00:00.000Z" },
        ])
      );
    });
  });

  describe("readStoredQuizScores", () => {
    it("returns empty array if nothing is stored", () => {
      expect(readStoredQuizScores()).toEqual([]);
    });

    it("returns parsed quiz scores if valid JSON is stored", () => {
      const validData = [
        { lessonId: "quiz-1", score: 100, passed: true, completedAt: "2026-01-01T00:00:00.000Z" },
      ];
      window.localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify(validData));

      expect(readStoredQuizScores()).toEqual(validData);
    });

    it("filters out invalid quiz scores from the stored array", () => {
      const mixedData = [
        { lessonId: "quiz-1", score: 100, passed: true, completedAt: "2026-01-01T00:00:00.000Z" },
        { lessonId: "quiz-2" }, // Missing required fields
        "not an object", // Invalid type
      ];
      window.localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify(mixedData));

      const result = readStoredQuizScores();
      expect(result).toHaveLength(1);
      expect(result[0].lessonId).toBe("quiz-1");
    });

    it("returns empty array if stored data is not an array", () => {
      window.localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify({ lessonId: "quiz-1" }));
      expect(readStoredQuizScores()).toEqual([]);
    });

    it("returns empty array if stored JSON is invalid", () => {
      window.localStorage.setItem(STORAGE_KEYS.quizScores, "invalid-json");
      expect(readStoredQuizScores()).toEqual([]);
    });
  });
});
