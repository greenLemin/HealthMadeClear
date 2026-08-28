import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function walkTsFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "coverage") continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkTsFiles(full, acc);
    } else if (name.endsWith(".ts") || name.endsWith(".tsx")) {
      acc.push(full);
    }
  }
  return acc;
}

function isUseClient(source: string): boolean {
  return (
    /^(?:["']use client["'];?\s*)/m.test(source) ||
    source.includes('"use client"') ||
    source.includes("'use client'")
  );
}

const COMBINED_BARREL_IMPORT =
  /from\s+["']@\/data\/(?:lesson|quiz|path|glossary)Bundles["']|import\(\s*["']@\/data\/(?:lesson|quiz|path|glossary)Bundles["']\s*\)/;

describe("locale bundle split (Phase 14)", () => {
  it("generators still write *.en.ts / *.es.ts and lessonMeta.ts", () => {
    const lessonsSrc = readFileSync(join(ROOT, "scripts/bundle-lessons.ts"), "utf8");
    expect(lessonsSrc).toMatch(/lessonBundles\.\$\{locale\}\.ts/);
    expect(lessonsSrc).toMatch(/lessonMeta\.ts/);
    expect(lessonsSrc).toMatch(/BEGINNER_LESSON_IDS/);

    const quizzesSrc = readFileSync(join(ROOT, "scripts/bundle-quizzes.ts"), "utf8");
    expect(quizzesSrc).toMatch(/quizBundles\.\$\{locale\}\.ts/);

    const pathsSrc = readFileSync(join(ROOT, "scripts/bundle-paths.ts"), "utf8");
    expect(pathsSrc).toMatch(/pathBundles\.\$\{locale\}\.ts/);

    const glossarySrc = readFileSync(join(ROOT, "scripts/bundle-glossary.ts"), "utf8");
    expect(glossarySrc).toMatch(/glossaryBundles\.\$\{locale\}\.ts/);

    for (const file of [
      "src/data/lessonBundles.en.ts",
      "src/data/lessonBundles.es.ts",
      "src/data/quizBundles.en.ts",
      "src/data/quizBundles.es.ts",
      "src/data/pathBundles.en.ts",
      "src/data/pathBundles.es.ts",
      "src/data/glossaryBundles.en.ts",
      "src/data/glossaryBundles.es.ts",
      "src/data/lessonMeta.ts",
    ]) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
  });

  it("combined barrels document do-not-import-from-client", () => {
    for (const script of [
      "scripts/bundle-lessons.ts",
      "scripts/bundle-quizzes.ts",
      "scripts/bundle-paths.ts",
      "scripts/bundle-glossary.ts",
    ]) {
      const src = readFileSync(join(ROOT, script), "utf8");
      expect(src).toMatch(/Do not import this combined barrel from 'use client' modules/);
    }
  });

  it("no 'use client' file imports a combined locale barrel", () => {
    const hits: string[] = [];
    for (const file of walkTsFiles(join(ROOT, "src"))) {
      const src = readFileSync(file, "utf8");
      if (!isUseClient(src)) continue;
      if (COMBINED_BARREL_IMPORT.test(src)) {
        hits.push(file.replace(ROOT + "/", ""));
      }
    }
    expect(hits).toEqual([]);
  });

  it("client progress path does not import loadPaths or loadLessons", () => {
    const pathsCache = readFileSync(join(ROOT, "src/hooks/useProgress/pathsCache.ts"), "utf8");
    expect(pathsCache).not.toMatch(/from ["']@\/lib\/paths\/loadPaths["']/);
    expect(pathsCache).not.toMatch(/import\(["']@\/lib\/paths\/loadPaths["']\)/);
    expect(pathsCache).not.toMatch(/loadLessons/);
    expect(pathsCache).toMatch(/import\(["']@\/data\/pathBundles\.en["']\)/);
    expect(pathsCache).toMatch(/import\(["']@\/data\/pathBundles\.es["']\)/);

    const sideEffects = readFileSync(join(ROOT, "src/hooks/useProgress/sideEffects.ts"), "utf8");
    expect(sideEffects).not.toMatch(/loadLessons/);
    expect(sideEffects).toMatch(/BEGINNER_LESSON_IDS/);
    expect(sideEffects).toMatch(/loadPathsForLocale/);

    const loadLessons = readFileSync(join(ROOT, "src/lib/lessons/loadLessons.ts"), "utf8");
    expect(loadLessons).not.toMatch(/from ["']@\/data\/lessonBundles["']/);
    expect(loadLessons).toMatch(/export function getAllLessons/);
    expect(loadLessons).not.toMatch(/export async function getAllLessons/);
  });

  it("search still lazy-loads searchIndex.${locale}", () => {
    const src = readFileSync(join(ROOT, "src/components/SearchDialog.tsx"), "utf8");
    expect(src).toMatch(/import\(`@\/data\/searchIndex\.\$\{locale\}\.ts`\)/);
  });

  it("lessons.ts imports the English locale module only", () => {
    const src = readFileSync(join(ROOT, "src/data/lessons.ts"), "utf8");
    expect(src).toMatch(/from ["']@\/data\/lessonBundles\.en["']/);
    expect(src).not.toMatch(/lessonBundles\.es/);
    expect(src).not.toMatch(/from ["']@\/data\/lessonBundles["']/);
  });
});
