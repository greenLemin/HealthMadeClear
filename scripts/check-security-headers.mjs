import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const PINNED_SUPABASE = /^(https|wss):\/\/[a-z0-9-]+\.supabase\.co\/?$/i;
const PINNED_SENTRY = /^https:\/\/[a-z0-9.-]+\.ingest\.sentry\.io\/?$/i;

export function extractConnectSrcTokens(source) {
  const withoutLineComments = source.replace(/^\s*(\/\/|#).*$/gm, "");
  const match = withoutLineComments.match(/connect-src\s+'self'([^;"]*)/);
  if (!match) return null;
  return ["'self'", ...match[1].trim().split(/\s+/).filter(Boolean)];
}

export function sortedUnique(tokens) {
  return [...new Set(tokens)].sort();
}

export function tokensEqual(a, b) {
  const left = sortedUnique(a);
  const right = sortedUnique(b);
  if (left.length !== right.length) return false;
  return left.every((token, i) => token === right[i]);
}

export function hasPinnedProjectRef(tokens) {
  return tokens.some((token) => PINNED_SUPABASE.test(token) || PINNED_SENTRY.test(token));
}

export function hasUnsafeInlineScriptSrc(source) {
  const withoutLineComments = source.replace(/^\s*(\/\/|#).*$/gm, "");
  const match = withoutLineComments.match(/script-src\s+([^;"]+)/);
  if (!match) return false;
  return match[1].split(/\s+/).includes("'unsafe-inline'");
}

export function checkSecurityHeaders({ nextSource, netlifySource, canonicalTokens }) {
  const errors = [];
  const nextTokens = extractConnectSrcTokens(nextSource);
  const netlifyTokens = extractConnectSrcTokens(netlifySource);

  if (!nextTokens) {
    errors.push("next.config.mjs: missing connect-src in Content-Security-Policy");
  }
  if (!netlifyTokens) {
    errors.push("netlify.toml: missing connect-src in Content-Security-Policy");
  }
  if (!Array.isArray(canonicalTokens) || canonicalTokens.length === 0) {
    errors.push("security-headers.json: connect-src must be a non-empty array");
  }

  if (nextTokens && hasPinnedProjectRef(nextTokens)) {
    errors.push(
      "next.config.mjs: connect-src pins a project-ref host; use *.supabase.co / *.ingest.sentry.io"
    );
  }
  if (netlifyTokens && hasPinnedProjectRef(netlifyTokens)) {
    errors.push("netlify.toml: connect-src pins a project-ref host; use *.supabase.co / *.ingest.sentry.io");
  }
  if (canonicalTokens && hasPinnedProjectRef(canonicalTokens)) {
    errors.push("security-headers.json: connect-src pins a project-ref host");
  }

  if (nextTokens && canonicalTokens && !tokensEqual(nextTokens, canonicalTokens)) {
    errors.push(
      `next.config.mjs connect-src diverges from security-headers.json\n  next: ${sortedUnique(nextTokens).join(" ")}\n  canonical: ${sortedUnique(canonicalTokens).join(" ")}`
    );
  }
  if (netlifyTokens && canonicalTokens && !tokensEqual(netlifyTokens, canonicalTokens)) {
    errors.push(
      `netlify.toml connect-src diverges from security-headers.json\n  netlify: ${sortedUnique(netlifyTokens).join(" ")}\n  canonical: ${sortedUnique(canonicalTokens).join(" ")}`
    );
  }
  if (nextTokens && netlifyTokens && !tokensEqual(nextTokens, netlifyTokens)) {
    errors.push("netlify.toml connect-src diverges from next.config.mjs");
  }

  if (!hasUnsafeInlineScriptSrc(nextSource)) {
    errors.push(
      "next.config.mjs: script-src must keep 'unsafe-inline' (do not hash pref-bootstrap.js to drop it)"
    );
  }
  if (!hasUnsafeInlineScriptSrc(netlifySource)) {
    errors.push(
      "netlify.toml: script-src must keep 'unsafe-inline' (do not hash pref-bootstrap.js to drop it)"
    );
  }

  return { ok: errors.length === 0, errors };
}

function parseArgs(argv) {
  const args = {
    next: join(repoRoot, "next.config.mjs"),
    netlify: join(repoRoot, "netlify.toml"),
    canonical: join(repoRoot, "security-headers.json"),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if ((flag === "--next" || flag === "--netlify" || flag === "--canonical") && value) {
      const key = flag.slice(2);
      args[key] = isAbsolute(value) ? value : resolve(process.cwd(), value);
      i += 1;
    }
  }
  return args;
}

function main() {
  const paths = parseArgs(process.argv.slice(2));
  const nextSource = readFileSync(paths.next, "utf8");
  const netlifySource = readFileSync(paths.netlify, "utf8");
  const canonical = JSON.parse(readFileSync(paths.canonical, "utf8"));
  const result = checkSecurityHeaders({
    nextSource,
    netlifySource,
    canonicalTokens: canonical["connect-src"],
  });
  if (!result.ok) {
    console.error("security-headers check failed:\n" + result.errors.join("\n"));
    process.exit(1);
  }
  console.log("security-headers: connect-src matches canonical list");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
