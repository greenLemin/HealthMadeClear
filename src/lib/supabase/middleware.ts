import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeRedirectPath } from "@/lib/auth/sanitizeRedirect";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured, shouldUseMockClient } from "./env";

export async function updateSession(request: NextRequest, response?: NextResponse) {
  let supabaseResponse = response || NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  // Keep in sync with src/i18n/routing.ts locales; using a local list to avoid
  // importing next-intl routing into middleware edge bundle, but must stay aligned.
  const locales = ["en", "es"];
  const isDashboardRoute = new RegExp(`^/(${locales.join("|")})/dashboard(\\/|$)`).test(pathname);

  // Mock client still needs dashboard guard — original early return bypassed it.
  // Check hmc_mock_db cookie (see src/lib/supabase/mock/store.ts) for an
  // authenticated mock session; redirect unauthenticated dashboard requests.
  if (shouldUseMockClient()) {
    if (isDashboardRoute) {
      const raw = request.cookies.get("hmc_mock_db")?.value;
      let isMockAuthenticated = false;
      if (raw) {
        try {
          const json =
            raw.startsWith("%7B") || raw.includes("%") ? decodeURIComponent(raw.split(",")[0]!) : raw;
          const db = JSON.parse(json) as {
            auth?: { current_user_id?: string | null; account?: { id?: string } };
          };
          isMockAuthenticated =
            db?.auth?.current_user_id != null && db.auth.current_user_id === db?.auth?.account?.id;
        } catch {
          // treat as unauthenticated
        }
      }
      if (!isMockAuthenticated) {
        const locale = pathname.split("/")[1] ?? "en";
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = `/${locale}/auth/login`;
        loginUrl.searchParams.set("redirect", sanitizeRedirectPath(pathname));
        return NextResponse.redirect(loginUrl);
      }
    }
    return supabaseResponse;
  }

  if (!isSupabaseConfigured()) {
    // Without Supabase credentials the server cannot verify sessions — dashboard
    // protection falls back to client-side AuthProvider. Avoid redirect loop
    // when unconfigured (e.g., static preview or missing env).
    return supabaseResponse;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Forward options to request cookies so downstream handlers see e.g. path/maxAge;
        // NextRequest cookies `set` may be typed as 2-arg in some versions — cast to allow 3-arg forwarding.
        cookiesToSet.forEach(({ name, value, options }) =>
          (request.cookies as unknown as { set: (n: string, v: string, o?: unknown) => void }).set(
            name,
            value,
            options
          )
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user: { id: string } | null = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // If Supabase is down, treat as unauthenticated — dashboard will redirect.
  }

  if (isDashboardRoute && !user) {
    const locale = pathname.split("/")[1] ?? "en";
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/auth/login`;
    loginUrl.searchParams.set("redirect", sanitizeRedirectPath(pathname));
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
