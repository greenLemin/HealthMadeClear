"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Link } from "@/i18n/navigation";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (authError) {
      setError(t("errorGeneric"));
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <Mail size={28} className="text-secondary" />
          </div>
          <h1 className="text-headline-lg text-primary">{t("resetLinkSentTitle")}</h1>
          <p className="mt-4 text-body-md text-on-surface-variant">{t("resetLinkSentMessage")}</p>
          <p className="mt-8 text-label-md text-on-surface-variant">
            <Link
              href="/auth/login"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
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
        <h1 className="text-headline-lg md:text-headline-xl text-primary">{t("forgotPasswordTitle")}</h1>
        <p className="mt-4 text-body-md text-on-surface-variant">{t("forgotPasswordSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          <Input
            label={t("emailLabel")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
            autoComplete="email"
          />

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" loading={loading} fullWidth>
            {t("sendResetLink")}
          </Button>

          <p className="text-center text-label-md text-on-surface-variant">
            <Link
              href="/auth/login"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              {t("backToLogin")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
