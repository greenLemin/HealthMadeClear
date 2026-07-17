import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeRedirectPath } from "@/lib/auth/sanitizeRedirect";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured, shouldUseMockClient } from "./env";

export async function updateSession(request: NextRequest, response?: NextResponse) {
  let supabaseResponse = response || NextResponse.next({ request });

  if (!isSupabaseConfigured() || shouldUseMockClient()) {
    return supabaseResponse;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = /^\/(en|es)\/dashboard(\/|$)/.test(pathname);

  if (isDashboardRoute && !user) {
    const locale = pathname.split("/")[1] ?? "en";
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/auth/login`;
    loginUrl.searchParams.set("redirect", sanitizeRedirectPath(pathname));
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
