const fs = require("fs");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

// The vulnerability report says to fix next to 16.3.0
packageJson.dependencies.next = "^16.3.0";
packageJson.devDependencies["@next/bundle-analyzer"] = "^16.3.0";
packageJson.devDependencies["eslint-config-next"] = "^16.3.0";
packageJson.overrides.next = "^16.3.0";
packageJson.overrides["brace-expansion"] = "^2.0.1";

fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2) + "\n");
