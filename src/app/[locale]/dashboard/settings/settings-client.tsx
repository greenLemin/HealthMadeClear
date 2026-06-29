"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { User, Mail, Shield, Trash2, Palette, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Reveal from "@/components/ui/Reveal";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/hooks/useAuth";
import { useAppState } from "@/components/AppProviders";
import type { ThemeMode } from "@/lib/preferences";

const Modal = dynamic(() => import("@/components/ui/Modal"), { ssr: false });

type SettingsClientProps = {
  displayName: string;
  email: string;
  memberSince: string;
  locale: string;
  userId: string;
};

export default function SettingsClient({
  displayName: initialDisplayName,
  email,
  locale,
  userId,
}: SettingsClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const { theme, setTheme } = useAppState();
  const t = useTranslations("settings");
  const tDash = useTranslations("dashboard");
  const deleteConfirmToken = t("deleteConfirmToken");

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  async function handleSaveProfile() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", userId);

    if (error) {
      showToast("error", t("profileUpdateFailed"));
    } else {
      showToast("success", t("profileUpdated"));
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/auth/reset-password`,
    });

    if (error) {
      showToast("error", t("resetLinkFailed"));
    } else {
      setPasswordSent(true);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== deleteConfirmToken) return;
    setDeleting(true);

    const { error: deleteError } = await supabase.rpc("delete_user");

    if (deleteError) {
      showToast("error", t("deleteFailed"));
      setDeleting(false);
      return;
    }

    await signOut();
    showToast("info", t("accountDeleted"));
    router.push("/");
  }

  const themeOptions: Array<{ value: ThemeMode; label: string }> = [
    { value: "light", label: t("themeLight") },
    { value: "dark", label: t("themeDark") },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        badge={tDash("navSettings")}
        title={t("title")}
        subtitle={displayName || tDash("defaultUser")}
        description={email}
      />

      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <section className="space-y-4">
            <h2 className="font-display text-headline-md text-primary">{t("profileSection")}</h2>
            <Card variant="accent" padding="md">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-headline-md font-bold text-on-primary shadow-elevation-2">
                    {(displayName || tDash("defaultUser")).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-label-lg font-semibold text-on-surface">
                      {displayName || tDash("defaultUser")}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">{email}</p>
                  </div>
                </div>
                <Input
                  label={t("displayNameLabel")}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  icon={<User size={18} />}
                />
                <div className="rounded-[1.2rem] border border-outline-variant bg-surface px-4 py-4 text-label-sm text-on-surface-variant">
                  <Mail size={14} className="mr-1 inline" />
                  {t("emailReadOnly", { email })}
                </div>
                <Button onClick={handleSaveProfile} loading={saving}>
                  {t("updateProfile")}
                </Button>
              </div>
            </Card>
          </section>
        </Reveal>

        <div className="space-y-8">
          <Reveal delay={0.04}>
            <section className="space-y-4">
              <h2 className="font-display text-headline-md text-primary">{t("accountSection")}</h2>
              <Card variant="glass" padding="md">
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-label-md font-semibold text-on-surface">{t("changePassword")}</p>
                      <p className="text-label-sm text-on-surface-variant">{t("changePasswordDesc")}</p>
                    </div>
                    <div>
                      {passwordSent ? (
                        <p className="rounded-full bg-secondary-container/30 px-4 py-2 text-label-md font-medium text-secondary">
                          {t("resetLinkSent", { email })}
                        </p>
                      ) : (
                        <Button variant="secondary" onClick={handleChangePassword}>
                          {t("sendResetLink")}
                        </Button>
                      )}
                    </div>
                  </div>
                  <hr className="border-outline-variant" />
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-label-md font-semibold text-error">{t("deleteAccount")}</p>
                      <p className="text-label-sm text-on-surface-variant">{t("deleteAccountDesc")}</p>
                    </div>
                    <Button
                      variant="danger"
                      icon={<Trash2 size={18} />}
                      onClick={() => setShowDeleteModal(true)}
                    >
                      {t("deleteAccount")}
                    </Button>
                  </div>
                </div>
              </Card>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <section className="space-y-4">
              <h2 className="font-display text-headline-md text-primary">{t("preferencesSection")}</h2>
              <Card variant="glass" padding="md">
                <div className="space-y-6">
                  <div>
                    <p className="mb-3 text-label-md font-semibold text-on-surface">{t("themeLabel")}</p>
                    <div className="flex flex-wrap gap-3">
                      {themeOptions.map((opt) => (
                        <Button
                          key={opt.value}
                          variant={theme === opt.value ? "primary" : "secondary"}
                          size="sm"
                          icon={<Palette size={16} />}
                          onClick={() => setTheme(opt.value)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <hr className="border-outline-variant" />
                  <div>
                    <p className="mb-3 text-label-md font-semibold text-on-surface">{t("languageLabel")}</p>
                    <div className="flex flex-wrap gap-3">
                      {(["en", "es"] as const).map((lang) => (
                        <Button
                          key={lang}
                          variant={locale === lang ? "primary" : "secondary"}
                          size="sm"
                          icon={<Globe size={16} />}
                          onClick={() => {
                            const path = window.location.pathname.replace(/^\/(en|es)/, `/${lang}`);
                            window.location.href = path;
                          }}
                        >
                          {lang === "en" ? t("english") : t("spanish")}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </Reveal>

          <Reveal delay={0.12}>
            <section className="space-y-4">
              <h2 className="font-display text-headline-md text-primary">{t("privacySection")}</h2>
              <Card variant="muted" padding="md">
                <div className="space-y-4">
                  <p className="text-label-sm text-on-surface-variant">{t("privacySummary")}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {t("dataExportNote", { email: t("privacyEmail") })}
                  </p>
                  <a
                    href={`/${locale}/privacy`}
                    className="inline-flex items-center gap-2 text-label-md font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    <Shield size={16} />
                    {t("readPrivacyPolicy")}
                  </a>
                </div>
              </Card>
            </section>
          </Reveal>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirm("");
        }}
        title={t("deleteAccount")}
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-[1.2rem] bg-error-container p-4 text-label-md text-on-error-container">
            {t("deleteModalWarning")}
          </div>
          <p className="text-label-sm text-on-surface-variant">
            {t("deleteModalConfirm", { token: deleteConfirmToken })}
          </p>
          <Input
            label={tDash("confirmationLabel")}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={t("deleteModalPlaceholder", { token: deleteConfirmToken })}
          />
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== deleteConfirmToken}
              loading={deleting}
              fullWidth
            >
              {t("deleteButton")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirm("");
              }}
              fullWidth
            >
              {tDash("cancel")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
