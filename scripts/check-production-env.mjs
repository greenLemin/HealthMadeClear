if (process.env.CI !== "true") {
  process.exit(0);
}

if (process.env.NETLIFY === "true" && !process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = process.env.URL || process.env.DEPLOY_PRIME_URL;
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
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set for production/CI builds."
  );
  process.exit(1);
}
