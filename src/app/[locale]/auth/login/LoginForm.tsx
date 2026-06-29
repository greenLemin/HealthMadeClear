"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Link } from "@/i18n/navigation";
import { Mail, Lock } from "lucide-react";
import { sanitizeRedirectPath } from "@/lib/auth/sanitizeRedirect";
import { migrateGuestProgressToSupabase } from "@/lib/guestProgress";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  // Display errors passed via URL params (e.g. from email confirmation or OAuth)
  const errorParam = searchParams.get("error");
  const urlError =
    errorParam === "confirmation_failed"
      ? t("errorConfirmationFailed")
      : errorParam === "auth_failed"
        ? t("errorAuthFailed")
        : null;

  function handleEmailChange(value: string) {
    setEmail(value);
    setError("");
    setFieldErrors((prev) => ({ ...prev, email: undefined }));
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setError("");
    setFieldErrors((prev) => ({ ...prev, password: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const nextFieldErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextFieldErrors.email = t("emailRequired");
    else if (!EMAIL_REGEX.test(email.trim())) nextFieldErrors.email = t("errorEmailInvalid");
    if (!password.trim()) nextFieldErrors.password = t("passwordRequired");
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(t("errorInvalidCredentials"));
      setLoading(false);
      return;
    }

    // Validate redirect param — only allow relative paths to prevent open redirect attacks
    const redirectParam = searchParams.get("redirect");
    const safeRedirect = sanitizeRedirectPath(redirectParam);

    if (data.user) {
      await migrateGuestProgressToSupabase(supabase, data.user.id);
    }

    router.push(safeRedirect);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* URL-based errors (confirmation failed, OAuth error, etc.) */}
      {urlError ? (
        <p
          role="alert"
          className="rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container"
        >
          {urlError}
        </p>
      ) : null}

      <Input
        label={t("emailLabel")}
        type="email"
        value={email}
        onChange={(e) => handleEmailChange(e.target.value)}
        icon={<Mail size={18} />}
        required
        autoComplete="email"
        error={fieldErrors.email}
      />

      <Input
        label={t("passwordLabel")}
        type="password"
        value={password}
        onChange={(e) => handlePasswordChange(e.target.value)}
        icon={<Lock size={18} />}
        required
        autoComplete="current-password"
        error={fieldErrors.password}
        showPasswordLabel={t("showPassword")}
        hidePasswordLabel={t("hidePassword")}
      />

      {/* Form submission errors */}
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} fullWidth>
        {t("loginButton")}
      </Button>

      <div className="flex flex-col gap-3 text-center text-label-md">
        <Link href="/auth/forgot-password" className="text-primary underline-offset-2 hover:underline">
          {t("forgotPasswordLink")}
        </Link>
        <p className="text-on-surface-variant">
          {t("signupLink")}{" "}
          <Link href="/auth/signup" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("signupCta")}
          </Link>
        </p>
      </div>
    </form>
  );
}
