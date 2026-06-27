import { describe, expect, it, vi } from "vitest";
import { getAllLearningPaths, getPathByIdFromBundle } from "./loadPaths";

vi.mock("@/data/pathBundles", () => ({
  pathBundles: {
    en: [
      { id: "path-1", title: "Path 1" },
      { id: "path-2", title: "Path 2" },
    ],
    es: [
      { id: "ruta-1", title: "Ruta 1" }
    ]
  }
}));

describe("loadPaths", () => {
  describe("getAllLearningPaths", () => {
    it("returns all paths for 'en' locale", () => {
      const paths = getAllLearningPaths("en");
      expect(paths).toHaveLength(2);
      expect(paths[0]).toEqual({ id: "path-1", title: "Path 1" });
    });

    it("returns all paths for 'es' locale", () => {
      const paths = getAllLearningPaths("es");
      expect(paths).toHaveLength(1);
      expect(paths[0]).toEqual({ id: "ruta-1", title: "Ruta 1" });
    });
  });

  describe("getPathByIdFromBundle", () => {
    it("returns the correct path for a valid id and 'en' locale", () => {
      const path = getPathByIdFromBundle("path-2", "en");
      expect(path).toEqual({ id: "path-2", title: "Path 2" });
    });

    it("returns undefined for an invalid id", () => {
      const path = getPathByIdFromBundle("invalid-id", "en");
      expect(path).toBeUndefined();
    });

    it("returns the correct path for a valid id and 'es' locale", () => {
      const path = getPathByIdFromBundle("ruta-1", "es");
      expect(path).toEqual({ id: "ruta-1", title: "Ruta 1" });
    });
  });
});
