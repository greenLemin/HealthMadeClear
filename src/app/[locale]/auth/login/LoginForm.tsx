"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormErrorAlert from "@/components/ui/FormErrorAlert";
import { Link } from "@/i18n/navigation";
import { Mail, Lock } from "lucide-react";
import { EMAIL_REGEX, isValidEmail } from "@/lib/validation";
import { sanitizeRedirectPath } from "@/lib/auth/sanitizeRedirect";
import { migrateGuestProgressToSupabase } from "@/lib/guestProgress";
import { useAuthFormState } from "@/lib/auth/useAuthFormState";

function getUrlError(errorParam: string | null, t: (key: string) => string) {
  if (!errorParam) return null;
  const errorMessages: Record<string, string> = {
    confirmation_failed: t("errorConfirmationFailed"),
    auth_failed: t("errorAuthFailed"),
    rate_limited: t("errorRateLimited"),
  };
  return errorMessages[errorParam] || null;
}

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error, fieldErrors, loading, setError, setFieldError, clearError, setLoading, supabase } =
    useAuthFormState();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const urlError = getUrlError(searchParams.get("error"), t);

  function handleEmailChange(value: string) {
    setEmail(value);
    clearError();
    setFieldError("email", undefined);
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    clearError();
    setFieldError("password", undefined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    const nextFieldErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextFieldErrors.email = t("emailRequired");
    else if (!isValidEmail(email)) nextFieldErrors.email = t("errorEmailInvalid");
    if (!password.trim()) nextFieldErrors.password = t("passwordRequired");
    setFieldError("email", nextFieldErrors.email);
    setFieldError("password", nextFieldErrors.password);
    if (nextFieldErrors.email || nextFieldErrors.password) return;

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(t("errorInvalidCredentials"));
        return;
      }

      if (!data.user) {
        setError(t("errorGeneric"));
        return;
      }

      const redirectParam = searchParams.get("redirect");
      const safeRedirect = sanitizeRedirectPath(redirectParam);

      try {
        await migrateGuestProgressToSupabase(supabase, data.user.id);
      } catch {
        // Non-fatal: continue with redirect even if migration fails
      }

      router.push(safeRedirect);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {urlError ? <FormErrorAlert error={urlError} /> : null}

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

      <FormErrorAlert error={error} />

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
