import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeRedirectPath } from "@/lib/auth/sanitizeRedirect";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured, shouldUseMockClient } from "./env";

function expireSbAuthCookies(request: NextRequest, res: NextResponse) {
  const sbCookies = request.cookies.getAll().filter((c) => /^sb-.*-auth-token/.test(c.name));
  sbCookies.forEach(({ name }) => {
    res.cookies.set(name, "", { maxAge: 0, path: "/" });
  });
}

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
          // Decode the full cookie value. Never split on "," — encoded JSON
          // uses %2C for commas, and raw JSON legitimately contains commas.
          // Truncating to the first comma breaks JSON.parse and forces a
          // false-unauthenticated redirect loop for mock users in dev.
          let json = raw;
          if (raw.startsWith("%7B") || raw.includes("%")) {
            try {
              json = decodeURIComponent(raw);
            } catch {
              json = raw;
            }
          }
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
        const redirectResponse = NextResponse.redirect(loginUrl);
        supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
        return redirectResponse;
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
        // (1) Always — 2xx and 3xx. Mutate the request Cookie header for downstream RSC / 200 rewrites.
        cookiesToSet.forEach(({ name, value, options }) =>
          (request.cookies as unknown as { set: (n: string, v: string, o?: unknown) => void }).set(
            name,
            value,
            options
          )
        );

        if (supabaseResponse.status >= 300 && supabaseResponse.status < 400) {
          // (2) True 3xx: do not NextResponse.next. Set cookies on THAT redirect.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          return;
        }

        // (3) 2xx (including next-intl rewrite): copy RESPONSE headers, not request.headers.
        const prevCookies = supabaseResponse.cookies.getAll();
        supabaseResponse = NextResponse.next({
          request,
          headers: supabaseResponse.headers, // ResponseInit — keeps x-middleware-rewrite
        });
        // then copy previous response cookies onto the new supabaseResponse, then cookiesToSet
        prevCookies.forEach(({ name, value, ...options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user: { id: string } | null = null;
  let authError: { message?: string } | null = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
    authError = result.error; // resolved AuthError, including stale JWT
  } catch {
    authError = null; // outage: do not expire
  }

  if (isDashboardRoute && !user) {
    const locale = pathname.split("/")[1] ?? "en";
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/auth/login`;
    loginUrl.searchParams.set("redirect", sanitizeRedirectPath(pathname));
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectResponse.cookies.set(name, value, options);
    });
    if (authError != null) {
      expireSbAuthCookies(request, redirectResponse);
    }
    return redirectResponse;
  }

  if (authError != null) {
    expireSbAuthCookies(request, supabaseResponse);
  }

  // Regression guard: if incoming i18n response was 3xx and current is 200, return the 3xx with cookies copied
  if (response && response.status >= 300 && response.status < 400 && supabaseResponse.status === 200) {
    const fallbackRedirect = response;
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      fallbackRedirect.cookies.set(name, value, options);
    });
    if (authError != null) {
      expireSbAuthCookies(request, fallbackRedirect);
    }
    return fallbackRedirect;
  }

  return supabaseResponse;
}
