import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeRedirectPath } from "@/lib/auth/sanitizeRedirect";
import { getLocaleFromPathname, loginErrorUrl } from "@/lib/auth/parseAuthRedirect";
import { getClientIp } from "@/lib/rateLimit";
import { checkRateLimitDistributed } from "@/lib/rateLimitDistributed";
import { reportServerError } from "@/lib/errorReporting";

export async function GET(request: NextRequest) {
  const locale = getLocaleFromPathname(request.nextUrl.pathname);
  const origin = request.nextUrl.origin;

  const limit = await checkRateLimitDistributed("auth-callback", getClientIp(request), 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.redirect(loginErrorUrl(origin, locale, "rate_limited"));
  }

  const code = request.nextUrl.searchParams.get("code");
  const next = sanitizeRedirectPath(request.nextUrl.searchParams.get("next"), `/${locale}/dashboard`);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        reportServerError(error, { route: "auth/callback", phase: "exchange" });
      } else {
        return NextResponse.redirect(new URL(next, request.url));
      }
    } catch (err) {
      reportServerError(err, { route: "auth/callback" });
    }
  }

  return NextResponse.redirect(loginErrorUrl(origin, locale, "auth_failed"));
}
