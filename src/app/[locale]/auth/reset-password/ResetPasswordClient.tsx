"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormErrorAlert from "@/components/ui/FormErrorAlert";
import { Lock } from "lucide-react";
import { useAuthFormState } from "@/lib/auth/useAuthFormState";
import { isOtpType } from "@/lib/auth/parseAuthRedirect";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPasswordClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { error, setError, clearError, supabase } = useAuthFormState();
  const { user, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [consumeFailed, setConsumeFailed] = useState(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const exchangedRef = useRef(false);
  const linkErrorRef = useRef(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = search.get("code") || hash.get("code");
    const tokenHash = search.get("token_hash") || hash.get("token_hash");
    const type = search.get("type") || hash.get("type");
    const canConsume = Boolean(code || (tokenHash && isOtpType(type)));

    if (canConsume) {
      if (exchangedRef.current) return;
      exchangedRef.current = true;
      // Strip query and hash before the async call so a retrigger cannot re-consume.
      window.history.replaceState({}, "", window.location.pathname);

      // Defer so a sync throw (missing verifyOtp, etc.) becomes a rejection, not an
      // error boundary, and setState is not in the effect body.
      void Promise.resolve()
        .then(async () => {
          const result = code
            ? await supabase.auth.exchangeCodeForSession(code)
            : isOtpType(type)
              ? await supabase.auth.verifyOtp({ token_hash: tokenHash!, type })
              : { error: { message: "invalid_otp_type" } };
          if (result.error) setConsumeFailed(true);
        })
        .catch(() => {
          setConsumeFailed(true);
        });
      return;
    }

    if (exchangedRef.current && !consumeFailed) return;

    if (authLoading) return;

    if (user) {
      if (linkErrorRef.current) {
        clearError();
        linkErrorRef.current = false;
      }
      return;
    }

    if (consumeFailed) {
      setError(t("errorGeneric"));
      linkErrorRef.current = true;
      return;
    }

    setError(t("errorInvalidResetLink"));
    linkErrorRef.current = true;
  }, [supabase, t, setError, clearError, user, authLoading, consumeFailed]);

  useEffect(() => {
    if (!submitted) return;
    successHeadingRef.current?.focus();
    const timer = setTimeout(() => router.push("/auth/login"), 2500);
    return () => clearTimeout(timer);
  }, [submitted, router]);

  function handlePasswordChange(value: string) {
    setPassword(value);
    clearError();
    setFieldErrors((prev) => ({ ...prev, password: undefined, confirm: undefined }));
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    clearError();
    setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    const nextFieldErrors: { password?: string; confirm?: string } = {};
    if (password.length < 8) nextFieldErrors.password = t("passwordMinLength");
    if (password !== confirmPassword) nextFieldErrors.confirm = t("passwordMismatch");
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(t("errorGeneric"));
        return;
      }

      setSubmitted(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
        <div
          className="surface-card-glass mx-auto max-w-2xl p-8 text-center"
          role="status"
          aria-live="polite"
        >
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
        <div
          className="surface-card-glass mx-auto max-w-2xl p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <h1 ref={successHeadingRef} tabIndex={-1} className="font-display text-headline-lg text-primary">
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
      <div className="surface-card-glass mx-auto max-w-2xl p-6 md:p-8">
        <h1 className="font-display text-headline-lg md:text-headline-xl text-primary">
          {t("resetPasswordTitle")}
        </h1>
        <p className="mt-4 text-body-md text-on-surface-variant">{t("resetPasswordSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          <fieldset className="space-y-6 border-0 p-0">
            <legend className="sr-only">{t("resetPasswordTitle")}</legend>
            <Input
              label={t("newPasswordLabel")}
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
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
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              icon={<Lock size={18} />}
              required
              autoComplete="new-password"
              error={fieldErrors.confirm}
              showPasswordLabel={t("showPassword")}
              hidePasswordLabel={t("hidePassword")}
            />
          </fieldset>

          <FormErrorAlert error={error} />

          <Button type="submit" loading={submitting} fullWidth>
            {t("resetPasswordButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}
