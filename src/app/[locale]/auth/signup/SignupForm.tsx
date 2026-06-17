"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Link } from "@/i18n/navigation";
import { Mail, Lock, User } from "lucide-react";

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: "", color: "", width: "0%" };
  if (password.length < 6) return { label: "weak", color: "bg-error", width: "25%" };
  if (password.length < 10) return { label: "fair", color: "bg-tertiary", width: "50%" };
  if (password.length < 14) return { label: "good", color: "bg-secondary", width: "75%" };
  return { label: "strong", color: "bg-secondary", width: "100%" };
}

export default function SignupForm() {
  const t = useTranslations("auth");
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("passwordMinLength"));
      return;
    }

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
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
          <Mail size={28} className="text-secondary" />
        </div>
        <h1 className="text-headline-lg text-primary">{t("checkEmailTitle")}</h1>
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
          onChange={(e) => setDisplayName(e.target.value)}
          icon={<User size={18} />}
          autoComplete="name"
        />

        <Input
          label={t("emailLabel")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          required
          autoComplete="email"
        />

        <div>
          <Input
            label={t("passwordLabel")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            required
            autoComplete="new-password"
            hint={t("passwordHint")}
          />
          {password ? (
            <div className="mt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className={`h-full rounded-full transition-all ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="mt-1 text-label-md text-on-surface-variant">
                {strength.label
                  ? t(`passwordStrength${strength.label.charAt(0).toUpperCase() + strength.label.slice(1)}`)
                  : ""}
              </p>
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
