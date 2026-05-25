import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PathId } from "@/types/content";
import { PATH_IDS } from "@/types/content";
import type { LearningPath } from "@/types/learningPath";

function pathFromFile(filePath: string): LearningPath {
  const { data } = matter(fs.readFileSync(filePath, "utf8"));

  return {
    id: data.id as PathId,
    title: String(data.title),
    description: String(data.description),
    lessons: Array.isArray(data.lessons) ? data.lessons.map(String) : [],
    duration: String(data.duration),
    level: data.level as LearningPath["level"],
    icon: String(data.icon),
  };
}

export function getPathMdxDir(locale: "en" | "es") {
  return path.join(process.cwd(), "content", "paths", locale);
}

export function getAllPathsFromMdx(locale: "en" | "es"): LearningPath[] {
  const dir = getPathMdxDir(locale);

  return PATH_IDS.map((id) => {
    const filePath = path.join(dir, `${id}.mdx`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing path MDX file: ${filePath}`);
    }
    return pathFromFile(filePath);
  });
}
