import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { sanitizeRedirectPath } from "@/lib/auth/sanitizeRedirect";
import type { User } from "@supabase/supabase-js";

export async function requireAuth(locale: string, redirectTo?: string): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    let href = "/auth/login";
    if (redirectTo) {
      const safeRedirect = sanitizeRedirectPath(redirectTo);
      href = `/auth/login?redirect=${encodeURIComponent(safeRedirect)}`;
    }
    redirect({ href, locale });
  }

  return user as User;
}
