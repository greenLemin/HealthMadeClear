import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getAllArticlesFromMdx } from "../src/lib/articles/mdxParser";
import { getAllLessonsFromMdx } from "../src/lib/lessons/mdxParser";
import { getAllQuizzesFromMdx } from "../src/lib/quizzes/quizParser";
import {
  assertFreshReview,
  assertSourcesAndReviewer,
  CITATION_DENYLIST,
  isDeniedCitation,
} from "./validate-content";

function readLesson(locale: "en" | "es", slug: string): string {
  return readFileSync(join(process.cwd(), "content", "lessons", locale, `${slug}.mdx`), "utf8");
}

function warningBlockAfter(raw: string, heading: string): string {
  const headingIdx = raw.indexOf(heading);
  expect(headingIdx).toBeGreaterThan(-1);
  const afterHeading = raw.slice(headingIdx);
  const warningStart = afterHeading.indexOf(":::warning");
  expect(warningStart).toBeGreaterThan(-1);
  const warningEnd = afterHeading.indexOf(":::", warningStart + ":::warning".length);
  expect(warningEnd).toBeGreaterThan(warningStart);
  return afterHeading.slice(warningStart, warningEnd);
}

describe("content validation rules", () => {
  it("rejects stub quiz explanations", async () => {
    const enQuizzes = await getAllQuizzesFromMdx("en");
    for (const quiz of enQuizzes) {
      for (const question of quiz.questions) {
        expect(question.explanation).not.toMatch(/ — correct\.$/);
        expect(question.explanation.length).toBeGreaterThan(40);
      }
    }
  });

  it("requires sources on a known article via the real parser", async () => {
    const articles = await getAllArticlesFromMdx("en");
    const eob = articles.find((article) => article.id === "understanding-your-eob");
    expect(eob).toBeDefined();
    expect(eob!.sources?.length).toBeGreaterThanOrEqual(1);
    expect(eob!.sources).toContain("CDC");
    expect(eob!.reviewedBy?.trim().length).toBeGreaterThanOrEqual(3);
    expect(() =>
      assertSourcesAndReviewer("Article understanding-your-eob", eob!.sources, eob!.reviewedBy)
    ).not.toThrow();
  });

  it("passes the current MDX corpus for sources and reviewedBy", async () => {
    const [enLessons, esLessons, enArticles, esArticles] = await Promise.all([
      getAllLessonsFromMdx("en"),
      getAllLessonsFromMdx("es"),
      getAllArticlesFromMdx("en"),
      getAllArticlesFromMdx("es"),
    ]);
    for (const item of [...enLessons, ...esLessons]) {
      expect(() =>
        assertSourcesAndReviewer(`Lesson ${item.id}`, item.sources, item.reviewedBy)
      ).not.toThrow();
      expect(() => assertFreshReview(`Lesson ${item.id}`, item.lastReviewed)).not.toThrow();
    }
    for (const item of [...enArticles, ...esArticles]) {
      expect(() =>
        assertSourcesAndReviewer(`Article ${item.id}`, item.sources, item.reviewedBy)
      ).not.toThrow();
      expect(() => assertFreshReview(`Article ${item.id}`, item.lastReviewed)).not.toThrow();
    }
  });

  it("fails missing or placeholder-denylisted citations and keeps the 400-day review fail", () => {
    expect(() => assertSourcesAndReviewer("Article x", [], "Health Education Review Team")).toThrow(
      /missing sources/
    );
    expect(() => assertSourcesAndReviewer("Article x", ["CDC"], "  ")).toThrow(/missing reviewedBy/);
    expect(() => assertSourcesAndReviewer("Article x", ["TBD"], "Health Education Review Team")).toThrow(
      /placeholder-denylisted/
    );
    expect(() => assertSourcesAndReviewer("Article x", ["CDC"], "Medical Team")).toThrow(
      /placeholder-denylisted/
    );
    expect(() =>
      assertSourcesAndReviewer("Article x", ["CDC"], "Health Education Review Team")
    ).not.toThrow();
    expect(() =>
      assertSourcesAndReviewer("Lesson x", ["FDA label guide"], "RN Health Education Team")
    ).not.toThrow();
    expect(() => assertFreshReview("Article stale", "2020-01-01")).toThrow(/older than 400 days/);
  });

  it("denies placeholder whole-strings and allows named review teams", () => {
    for (const denied of CITATION_DENYLIST) {
      expect(isDeniedCitation(denied)).toBe(true);
      expect(isDeniedCitation(denied.toUpperCase())).toBe(true);
    }
    expect(isDeniedCitation("Health Education Review Team")).toBe(false);
    expect(isDeniedCitation("RN Health Education Team")).toBe(false);
    expect(isDeniedCitation("Search")).toBe(false);
    expect(isDeniedCitation("Online")).toBe(false);
    expect(isDeniedCitation("Online Search")).toBe(false);
    expect(isDeniedCitation("Various")).toBe(false);
    expect(isDeniedCitation("CDC website")).toBe(false);
  });

  it("places Poison Help on prescription-label lessons before Special Warnings, in the dosage warning", () => {
    const en = readLesson("en", "understanding-prescription-labels");
    const es = readLesson("es", "understanding-prescription-labels");

    expect(en).toMatch(/222-1222/);
    expect(es).toMatch(/222-1222/);
    expect(en).toMatch(/911 first/);
    expect(es).toMatch(/llame primero al 911/);

    expect(en.indexOf("222-1222")).toBeLessThan(en.indexOf("## Special Warnings"));
    expect(es.indexOf("222-1222")).toBeLessThan(es.indexOf("## Advertencias especiales"));

    expect(warningBlockAfter(en, "## Understanding Dosage Instructions")).toContain("222-1222");
    expect(warningBlockAfter(es, "## Cómo entender la dosis")).toContain("222-1222");

    expect(readLesson("en", "pain-medications-safely")).toMatch(/222-1222/);
    expect(readLesson("es", "pain-medications-safely")).toMatch(/222-1222/);

    expect(existsSync(join(process.cwd(), "content/lessons/en/managing-multiple-medications.mdx"))).toBe(
      false
    );
    expect(existsSync(join(process.cwd(), "content/lessons/en/managing-high-blood-pressure.mdx"))).toBe(
      false
    );
  });
});
