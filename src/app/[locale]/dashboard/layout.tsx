import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { requireLocale } from "@/lib/locale";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  const user = await requireAuth(locale, "/dashboard");
  const supabase = await createClient();

  const [profileResult, streakResult] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    supabase.from("streaks").select("current_streak").eq("user_id", user.id).single(),
  ]);

  const displayName = profileResult.data?.display_name ?? user.email?.split("@")[0] ?? "User";
  const email = user.email ?? undefined;
  const streak = streakResult.data?.current_streak ?? 0;

  return (
    <div className="mx-auto flex max-w-[1340px] px-4 md:px-6">
      <DashboardSidebar displayName={displayName} email={email} streak={streak} />
      <div className="min-h-[calc(100vh-5rem)] flex-1 py-8 pb-24 md:pb-8">
        <div className="mx-auto max-w-[1100px]">{children}</div>
      </div>
    </div>
  );
}
