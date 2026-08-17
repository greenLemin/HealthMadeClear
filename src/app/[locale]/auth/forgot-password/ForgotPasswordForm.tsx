"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormErrorAlert from "@/components/ui/FormErrorAlert";
import { Link } from "@/i18n/navigation";
import { Mail } from "lucide-react";
import { isValidEmail } from "@/lib/validation";
import { useAuthFormState } from "@/lib/auth/useAuthFormState";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const { error, loading, setError, clearError, setLoading, supabase } = useAuthFormState();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (submitted) successHeadingRef.current?.focus();
  }, [submitted]);

  function handleEmailChange(value: string) {
    setEmail(value);
    clearError();
    setFieldError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setFieldError("");

    if (!email.trim()) {
      setFieldError(t("emailRequired"));
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError(t("errorEmailInvalid"));
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/auth/reset-password`,
      });

      if (authError) {
        setError(t("errorGeneric"));
        return;
      }

      setSubmitted(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg text-center" role="status" aria-live="polite">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container"
          aria-hidden="true"
        >
          <Mail size={28} className="text-secondary" />
        </div>
        <h1 ref={successHeadingRef} tabIndex={-1} className="text-headline-lg text-primary">
          {t("resetLinkSentTitle")}
        </h1>
        <p className="mt-4 text-body-md text-on-surface-variant">{t("resetLinkSentMessage")}</p>
        <p className="mt-8 text-label-md text-on-surface-variant">
          <Link href="/auth/login" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-headline-lg md:text-headline-xl text-primary">{t("forgotPasswordTitle")}</h1>
      <p className="mt-4 text-body-md text-on-surface-variant">{t("forgotPasswordSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        <Input
          label={t("emailLabel")}
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          icon={<Mail size={18} />}
          required
          autoComplete="email"
          error={fieldError}
        />

        <FormErrorAlert error={error} />

        <Button type="submit" loading={loading} fullWidth>
          {t("sendResetLink")}
        </Button>

        <p className="text-center text-label-md text-on-surface-variant">
          <Link href="/auth/login" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </form>
    </>
  );
}
