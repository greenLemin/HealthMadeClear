import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getSupabaseUrl(): string {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  } catch {
    return "https://placeholder.supabase.co";
  }
}

function getSupabaseAnonKey(): string {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_anon_key";
  } catch {
    return "placeholder_anon_key";
  }
}

export async function updateSession(request: NextRequest, response?: NextResponse) {
  let supabaseResponse = response || NextResponse.next({ request });

  if (getSupabaseUrl() === "https://placeholder.supabase.co") {
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

  await supabase.auth.getUser();
  return supabaseResponse;
}
