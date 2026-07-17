import fs from "fs/promises";
import { getArticleFromMdx, getAllArticlesFromMdx } from "./src/lib/articles/mdxParser";

async function run() {
  const hrstart = process.hrtime();
  // Call `getArticleFromMdx` concurrently to see the unblocking benefit
  const promises = [];
  for (let i = 0; i < 1000; i++) {
    promises.push(getArticleFromMdx("choosing-primary-care-doctor", "en"));
  }
  await Promise.all(promises);
  const hrend = process.hrtime(hrstart);
  console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
}

run();
