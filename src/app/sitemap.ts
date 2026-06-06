import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { lessons } from "@/data/lessons";
import { glossaryBundles } from "@/data/glossaryBundles";
import { getSiteUrl } from "@/lib/site";

const staticPaths = [
  "",
  "/learn",
  "/learning-paths",
  "/tools",
  "/tools/visit-planner",
  "/tools/visit-checklist",
  "/tools/care-guide",
  "/dashboard",
  "/glossary",
  "/about",
  "/privacy",
  "/accessibility",
];

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
    lessons.map((lesson) => ({
      url: `${base}/${locale}/learn/${lesson.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, `${base}/${alt}/learn/${lesson.id}`])
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

  return [...localizedStatic, ...localizedLessons, ...localizedGlossaryTerms];
}
