if (process.env.CI !== "true") {
  process.exit(0);
}

if (process.env.NETLIFY === "true" && !process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = process.env.URL || process.env.DEPLOY_PRIME_URL;
}

// Bridge legacy Netlify var names → Next.js public vars (build-time only)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_URL?.trim()) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_URL.trim();
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_DATABASE_URL?.trim()) {
  const dbUrl = process.env.SUPABASE_DATABASE_URL.trim();
  // Netlify Supabase integration provisions SUPABASE_DATABASE_URL as the
  // project REST endpoint (e.g. "https://[ref].supabase.co") — despite the
  // misleading name, it is NOT a postgres connection string. Use it directly.
  if (/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(dbUrl)) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = dbUrl.replace(/\/$/, "");
  } else {
    // Fallback: older integrations may provision a postgres connection string.
    // Extract [ref] and derive the REST endpoint.
    const m = dbUrl.match(/postgres\.([a-z0-9]+):/);
    if (m) process.env.NEXT_PUBLIC_SUPABASE_URL = `https://${m[1]}.supabase.co`;
  }
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() && process.env.SUPABASE_ANON_KEY?.trim()) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY.trim();
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!siteUrl || siteUrl.includes("localhost")) {
  console.error("NEXT_PUBLIC_SITE_URL must be set to a public URL for production/CI builds.");
  process.exit(1);
}

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "https://placeholder.supabase.co" ||
  supabaseAnonKey === "placeholder_anon_key"
) {
  console.error(
    "Missing Supabase public env vars for production/CI build.\n" +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Netlify.\n" +
      "(Legacy SUPABASE_ANON_KEY alone is not enough — URL must also be set.)"
  );
  process.exit(1);
}
