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
      console.error("[auth/callback]", err);
    }
  }

  return NextResponse.redirect(new URL("/auth/login?error=auth_failed", request.url));
}
