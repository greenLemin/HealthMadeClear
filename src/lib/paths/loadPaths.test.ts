import { describe, expect, it, vi } from "vitest";
import { getAllLearningPaths, getPathByIdFromBundle, loadPathsForLocale } from "./loadPaths";

vi.mock("@/data/pathBundles.en", () => ({
  paths: [
    {
      id: "en-path-1",
      title: "English Path 1",
      description: "desc",
      duration: "1h",
      level: "beginner",
      icon: "book",
      lessons: [],
    },
    {
      id: "en-path-2",
      title: "English Path 2",
      description: "desc",
      duration: "1h",
      level: "beginner",
      icon: "book",
      lessons: [],
    },
  ],
}));

vi.mock("@/data/pathBundles.es", () => ({
  paths: [
    {
      id: "es-path-1",
      title: "Ruta en Español 1",
      description: "desc",
      duration: "1h",
      level: "beginner",
      icon: "book",
      lessons: [],
    },
  ],
}));

describe("loadPaths", () => {
  describe("getAllLearningPaths", () => {
    it("returns all english paths", () => {
      const paths = getAllLearningPaths("en");
      expect(paths).toHaveLength(2);
      expect(paths[0]?.id).toBe("en-path-1");
      expect(paths[1]?.id).toBe("en-path-2");
    });

    it("returns all spanish paths", () => {
      const paths = getAllLearningPaths("es");
      expect(paths).toHaveLength(1);
      expect(paths[0]?.id).toBe("es-path-1");
    });
  });

  describe("getPathByIdFromBundle", () => {
    it("finds a specific english path by id", () => {
      const path = getPathByIdFromBundle("en-path-2", "en");
      expect(path).toBeDefined();
      expect(path?.id).toBe("en-path-2");
      expect(path?.title).toBe("English Path 2");
    });

    it("finds a specific spanish path by id", () => {
      const path = getPathByIdFromBundle("es-path-1", "es");
      expect(path).toBeDefined();
      expect(path?.id).toBe("es-path-1");
      expect(path?.title).toBe("Ruta en Español 1");
    });

    it("returns undefined for a missing path id", () => {
      const path = getPathByIdFromBundle("missing-path", "en");
      expect(path).toBeUndefined();
    });

    it("returns undefined for an id from a different locale", () => {
      const path = getPathByIdFromBundle("es-path-1", "en");
      expect(path).toBeUndefined();
    });
  });

  describe("loadPathsForLocale", () => {
    it("dynamic-imports only the English locale module", async () => {
      const paths = await loadPathsForLocale("en");
      expect(paths).toHaveLength(2);
      expect(paths[0]?.id).toBe("en-path-1");
      expect(JSON.stringify(paths)).not.toContain("Ruta en Español");
    });

    it("dynamic-imports only the Spanish locale module", async () => {
      const paths = await loadPathsForLocale("es");
      expect(paths).toHaveLength(1);
      expect(paths[0]?.id).toBe("es-path-1");
    });
  });
});
