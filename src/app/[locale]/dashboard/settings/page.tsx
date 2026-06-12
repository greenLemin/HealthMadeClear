import { getTranslations } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { requireAuth } from "@/lib/auth/requireAuth";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/dashboard";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "settings" });
  return { title: t("title"), robots: { index: false } };
}

type Props = { params: { locale: string } };

export default async function SettingsPage({ params }: Props) {
  const locale = requireLocale(params.locale);
  const user = await requireAuth(locale, "/dashboard/settings");
  const supabase = await createClient();

  const profile = await getUserProfile(supabase, user.id);

  return (
    <SettingsClient
      displayName={profile?.displayName ?? ""}
      email={profile?.email ?? user.email ?? ""}
      memberSince={profile?.createdAt ?? ""}
      locale={locale}
      userId={user.id}
    />
  );
}
