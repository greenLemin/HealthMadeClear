import fs from "fs/promises";
import { getArticleFromMdx, getAllArticlesFromMdx } from "./src/lib/articles/mdxParser";

async function run() {
  const hrstart = process.hrtime();
  for (let i = 0; i < 100; i++) {
    await getArticleFromMdx("choosing-primary-care-doctor", "en");
  }
  const hrend = process.hrtime(hrstart);
  console.info("Baseline Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
}

run();
