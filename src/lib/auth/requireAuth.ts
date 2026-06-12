import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import type { User } from "@supabase/supabase-js";

export async function requireAuth(locale: string, redirectTo?: string): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const href = redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : "/auth/login";
    redirect({ href, locale });
  }

  return user as User;
}
