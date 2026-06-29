const fs = require("fs");
const path = require("path");

try {
  const jsYamlDir = path.dirname(require.resolve("js-yaml/package.json"));
  const indexJsPath = path.join(jsYamlDir, "index.js");

  if (!fs.existsSync(indexJsPath)) {
    console.error(`[Patch] FATAL: could not find js-yaml index file at: ${indexJsPath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(indexJsPath, "utf8");
  let patched = false;

  // Replace safeLoad renamed function with standard load
  if (content.includes("module.exports.safeLoad = renamed('safeLoad', 'load')")) {
    content = content.replace(
      "module.exports.safeLoad = renamed('safeLoad', 'load')",
      "module.exports.safeLoad = module.exports.load"
    );
    patched = true;
  }

  // Replace safeDump renamed function with standard dump
  if (content.includes("module.exports.safeDump = renamed('safeDump', 'dump')")) {
    content = content.replace(
      "module.exports.safeDump = renamed('safeDump', 'dump')",
      "module.exports.safeDump = module.exports.dump"
    );
    patched = true;
  }

  if (patched) {
    fs.writeFileSync(indexJsPath, content, "utf8");
    console.log(`[Patch] Patched ${indexJsPath} for gray-matter compatibility.`);
  } else {
    // safeLoad/safeDump already aliased — no-op is fine (e.g. CI cache re-use)
    console.log("[Patch] js-yaml already compatible — skipping patch.");
  }
} catch (e) {
  // A genuine unexpected error (e.g. permissions, module not found): fail loudly
  console.error("[Patch] FATAL: Failed to patch js-yaml:", e.message);
  process.exit(1);
}
