const fs = require("fs");

const path = "src/lib/articles/mdxParser.ts";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `      if (!fs.existsSync(filePath)) {
        throw new Error(\`Missing article MDX file: \${filePath}\`);
      }`,
  `      try {
        await fsPromises.access(filePath);
      } catch {
        throw new Error(\`Missing article MDX file: \${filePath}\`);
      }`
);

content = content.replace(
  `  if (!fs.existsSync(filePath)) return undefined;`,
  `  try {
    await fsPromises.access(filePath);
  } catch {
    return undefined;
  }`
);

fs.writeFileSync(path, content, "utf8");
