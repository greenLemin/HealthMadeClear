import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { articles } from "@/data/articles";
import { lessons } from "@/data/lessons";
import { paths } from "@/data/paths";
import { glossaryBundles } from "@/data/glossaryBundles";
import { getSiteUrl } from "@/lib/site";

const staticPaths = [
  "",
  "/learn",
  "/articles",
  "/learning-paths",
  "/tools",
  "/tools/visit-planner",
  "/tools/visit-checklist",
  "/tools/care-guide",
  "/glossary",
  "/about",
  "/privacy",
  "/terms",
  "/accessibility",
  "/contact",
];

function parseReviewDate(value?: string): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const localizedStatic = routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((alt) => [alt, `${base}/${alt}${path}`])),
      },
    }))
  );

  const localizedLessons = routing.locales.flatMap((locale) =>
    lessons.flatMap((lesson) => {
      const reviewed = parseReviewDate(lesson.lastReviewed);
      return [
        {
          url: `${base}/${locale}/learn/${lesson.id}`,
          lastModified: reviewed,
          changeFrequency: "monthly" as const,
          priority: 0.7,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((alt) => [alt, `${base}/${alt}/learn/${lesson.id}`])
            ),
          },
        },
        {
          url: `${base}/${locale}/learn/${lesson.id}/quiz`,
          lastModified: reviewed,
          changeFrequency: "monthly" as const,
          priority: 0.65,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((alt) => [alt, `${base}/${alt}/learn/${lesson.id}/quiz`])
            ),
          },
        },
      ];
    })
  );

  const localizedArticles = routing.locales.flatMap((locale) =>
    articles.map((article) => ({
      url: `${base}/${locale}/articles/${article.id}`,
      lastModified: parseReviewDate(article.lastReviewed),
      changeFrequency: "monthly" as const,
      priority: 0.68,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, `${base}/${alt}/articles/${article.id}`])
        ),
      },
    }))
  );

  const localizedGlossaryTerms = routing.locales.flatMap((locale) =>
    glossaryBundles[locale as keyof typeof glossaryBundles].map((term) => ({
      url: `${base}/${locale}/glossary/${term.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, `${base}/${alt}/glossary/${term.id}`])
        ),
      },
    }))
  );

  const localizedPaths = routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}/${locale}/learning-paths/${path.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, `${base}/${alt}/learning-paths/${path.id}`])
        ),
      },
    }))
  );

  return [
    ...localizedStatic,
    ...localizedLessons,
    ...localizedArticles,
    ...localizedGlossaryTerms,
    ...localizedPaths,
  ];
}
