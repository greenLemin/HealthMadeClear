"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Link } from "@/i18n/navigation";
import { Mail, Lock, User } from "lucide-react";

function getPasswordStrength(password: string): {
  label: string;
  color: string;
  width: string;
  value: number;
} {
  if (!password) return { label: "", color: "", width: "0%", value: 0 };
  if (password.length < 6) return { label: "weak", color: "bg-error", width: "25%", value: 25 };
  if (password.length < 10) return { label: "fair", color: "bg-tertiary", width: "50%", value: 50 };
  if (password.length < 14) return { label: "good", color: "bg-secondary", width: "75%", value: 75 };
  return { label: "strong", color: "bg-secondary", width: "100%", value: 100 };
}

export default function SignupForm() {
  const t = useTranslations("auth");
  const supabase = useMemo(() => createClient(), []);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const strength = getPasswordStrength(password);
  const strengthLabel = strength.label
    ? t(`passwordStrength${strength.label.charAt(0).toUpperCase() + strength.label.slice(1)}`)
    : "";

  useEffect(() => {
    if (submitted) successHeadingRef.current?.focus();
  }, [submitted]);

  function handleDisplayNameChange(value: string) {
    setDisplayName(value);
    setError("");
  }

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
    if (!password.trim()) nextFieldErrors.password = t("passwordRequired");
    else if (password.length < 8) nextFieldErrors.password = t("passwordMinLength");
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError(t("errorEmailInUse"));
      } else {
        setError(t("errorGeneric"));
      }
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
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
          {t("checkEmailTitle")}
        </h1>
        <p className="mt-4 text-body-md text-on-surface-variant">{t("checkEmailMessage")}</p>
        <p className="mt-8 text-label-md text-on-surface-variant">
          {t("loginLink")}{" "}
          <Link href="/auth/login" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("loginCta")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-headline-lg md:text-headline-xl text-primary">{t("signupTitle")}</h1>
      <p className="mt-4 text-body-md text-on-surface-variant">{t("signupSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        <Input
          label={t("displayNameLabel")}
          type="text"
          value={displayName}
          onChange={(e) => handleDisplayNameChange(e.target.value)}
          icon={<User size={18} />}
          autoComplete="name"
        />

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

        <div>
          <Input
            label={t("passwordLabel")}
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            icon={<Lock size={18} />}
            required
            autoComplete="new-password"
            hint={t("passwordHint")}
            error={fieldErrors.password}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
          />
          {password ? (
            <div className="mt-2">
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high"
                role="progressbar"
                aria-valuenow={strength.value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t("passwordStrengthLabel")}
                aria-valuetext={strengthLabel}
              >
                <div
                  className={`h-full rounded-full transition-all motion-reduce:transition-none ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="mt-1 text-label-md text-on-surface-variant">{strengthLabel}</p>
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" loading={loading} fullWidth>
          {t("signupButton")}
        </Button>

        <p className="text-center text-label-md text-on-surface-variant">
          {t("agreement")}{" "}
          <Link href="/terms" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("termsLink")}
          </Link>{" "}
          {t("and")}{" "}
          <Link href="/privacy" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("privacyLink")}
          </Link>
        </p>

        <p className="text-center text-label-md text-on-surface-variant">
          {t("loginLink")}{" "}
          <Link href="/auth/login" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("loginCta")}
          </Link>
        </p>
      </form>
    </>
  );
}
