import type { MetadataRoute } from "next";
import { lessons } from "@/data/lessons";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticRoutes = [
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

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...lessons.map((lesson) => ({
      url: `${base}/learn/${lesson.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
