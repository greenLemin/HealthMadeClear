const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.dependencies.next = "16.3.0";
pkg.devDependencies["eslint-config-next"] = "16.3.0";
pkg.devDependencies["@next/bundle-analyzer"] = "16.3.0";

pkg.overrides = pkg.overrides || {};
pkg.overrides.next = "16.3.0";
pkg.overrides["eslint-config-next"] = "16.3.0";
pkg.overrides["@next/bundle-analyzer"] = "16.3.0";
pkg.overrides["brace-expansion"] = "^1.1.11";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + "\n");
