"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace("#", "?"));
    const code = params.get("code");

    if (!code) {
      setError(t("errorGeneric"));
      setLoading(false);
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }: any) => {
        if (exchangeError) {
          setError(t("errorGeneric"));
        }
      })
      .finally(() => setLoading(false));
  }, [supabase, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("passwordMinLength"));
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(t("errorGeneric"));
      setSubmitting(false);
      return;
    }

    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-body-md text-on-surface-variant">{t("loadingMessage")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-lg">
        <h1 className="text-headline-lg md:text-headline-xl text-primary">{t("resetPasswordTitle")}</h1>
        <p className="mt-4 text-body-md text-on-surface-variant">{t("resetPasswordSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          <Input
            label={t("newPasswordLabel")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            required
            autoComplete="new-password"
          />

          <Input
            label={t("confirmPasswordLabel")}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock size={18} />}
            required
            autoComplete="new-password"
          />

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" loading={submitting} fullWidth>
            {t("resetPasswordButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}
