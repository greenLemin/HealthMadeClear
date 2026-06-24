"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Lock } from "lucide-react";

export default function ResetPasswordClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

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

  useEffect(() => {
    if (!submitted) return;
    successHeadingRef.current?.focus();
    const timer = setTimeout(() => router.push("/auth/login"), 2500);
    return () => clearTimeout(timer);
  }, [submitted, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const nextFieldErrors: { password?: string; confirm?: string } = {};
    if (password.length < 8) nextFieldErrors.password = t("passwordMinLength");
    if (password !== confirmPassword) nextFieldErrors.confirm = t("passwordMismatch");
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(t("errorGeneric"));
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-lg text-center" role="status" aria-live="polite">
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent motion-reduce:animate-none"
            aria-hidden="true"
          />
          <p className="mt-4 text-body-md text-on-surface-variant">{t("loadingMessage")}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-lg text-center" role="status" aria-live="polite">
          <h1 ref={successHeadingRef} tabIndex={-1} className="text-headline-lg text-primary">
            {t("resetSuccessTitle")}
          </h1>
          <p className="mt-4 text-body-md text-on-surface-variant">{t("resetSuccessMessage")}</p>
          <p className="mt-8 text-label-md text-on-surface-variant">
            <Link href="/auth/login" className="font-semibold text-primary underline underline-offset-2">
              {t("backToLogin")}
            </Link>
          </p>
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
          <fieldset className="space-y-6 border-0 p-0">
            <legend className="sr-only">{t("resetPasswordTitle")}</legend>
            <Input
              label={t("newPasswordLabel")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
              autoComplete="new-password"
              error={fieldErrors.password}
              showPasswordLabel={t("showPassword")}
              hidePasswordLabel={t("hidePassword")}
            />

            <Input
              label={t("confirmPasswordLabel")}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
              autoComplete="new-password"
              error={fieldErrors.confirm}
              showPasswordLabel={t("showPassword")}
              hidePasswordLabel={t("hidePassword")}
            />
          </fieldset>

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
