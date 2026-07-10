import fs from "fs";
import path from "path";
import type { LearningPath } from "../src/types/learningPath";
import { getAllPathsFromMdx } from "../src/lib/paths/mdxParser";

function pathToMdx(pathItem: LearningPath) {
  const frontmatter = {
    id: pathItem.id,
    title: pathItem.title,
    description: pathItem.description,
    lessons: pathItem.lessons,
    duration: pathItem.duration,
    level: pathItem.level,
    icon: pathItem.icon,
  };

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");

  return `---\n${yaml}\n---\n`;
}

function writePath(locale: "en" | "es", pathItem: LearningPath) {
  const dir = path.join(process.cwd(), "content", "paths", locale);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${pathItem.id}.mdx`), pathToMdx(pathItem), "utf8");
}

async function main() {
  const learningPaths = await getAllPathsFromMdx("en");
  for (const pathItem of learningPaths) {
    writePath("en", pathItem);
  }

  const esPaths = await getAllPathsFromMdx("es");
  for (const pathItem of esPaths) {
    writePath("es", pathItem);
  }

  console.log(`Generated ${learningPaths.length} EN and ${esPaths.length} ES path MDX files.`);
}
main().catch(console.error);
