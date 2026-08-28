// NOTE: This route handles email/OTP confirmation flow, not OAuth.
// For OAuth redirect callback handling, see src/app/[locale]/auth/callback/route.ts.
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeRedirectPath } from "@/lib/auth/sanitizeRedirect";
import {
  getLocaleFromPathname,
  isOtpType,
  loginErrorUrl,
  recoveryRedirect,
} from "@/lib/auth/parseAuthRedirect";
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
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const successPath =
    type === "recovery"
      ? recoveryRedirect(locale)
      : sanitizeRedirectPath(request.nextUrl.searchParams.get("next"), `/${locale}/dashboard`);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        reportServerError(error, { route: "auth/confirm", phase: "exchange" });
      } else {
        return NextResponse.redirect(new URL(successPath, request.url));
      }
    } catch (err) {
      reportServerError(err, { route: "auth/confirm" });
    }
  } else if (tokenHash && isOtpType(type)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

      if (error) {
        reportServerError(error, { route: "auth/confirm", phase: "verify" });
      } else {
        return NextResponse.redirect(new URL(successPath, request.url));
      }
    } catch (err) {
      reportServerError(err, { route: "auth/confirm" });
    }
  }

  return NextResponse.redirect(loginErrorUrl(origin, locale, "confirmation_failed"));
}
