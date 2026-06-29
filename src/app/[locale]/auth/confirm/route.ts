// NOTE: This route handles email/OTP confirmation flow, not OAuth.
// For OAuth redirect callback handling, see src/app/[locale]/auth/callback/route.ts.
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeRedirectPath } from "@/lib/auth/sanitizeRedirect";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { reportServerError } from "@/lib/errorReporting";

export async function GET(request: NextRequest) {
  const limit = checkRateLimit("auth-callback", getClientIp(request), 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.redirect(new URL("/auth/login?error=rate_limited", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(new URL(next, request.url));
      }
    } catch (err) {
      reportServerError(err, { route: "auth/confirm" });
    }
  }

  return NextResponse.redirect(new URL("/auth/login?error=confirmation_failed", request.url));
}
