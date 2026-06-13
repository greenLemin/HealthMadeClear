// NOTE: This route handles email/OTP confirmation flow, not OAuth.
// For OAuth redirect callback handling, see src/app/[locale]/auth/callback/route.ts.
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeRedirectPath } from "@/lib/auth/sanitizeRedirect";

export async function GET(request: NextRequest) {
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
      console.error("[auth/confirm]", err);
    }
  }

  return NextResponse.redirect(new URL("/auth/login?error=confirmation_failed", request.url));
}
