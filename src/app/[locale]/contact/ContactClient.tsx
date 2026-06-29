"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, User, MessageSquare, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const SUBJECTS = ["general", "content-feedback", "accessibility-issue", "privacy-request", "other"] as const;

export default function ContactClient() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t("errorName");
    if (!email.trim()) errs.email = t("errorEmail");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("errorEmailInvalid");
    if (!message.trim()) errs.message = t("errorMessage");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;

    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject, message: message.trim() }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch {
      setErrors({ form: t("errorGeneric") });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-container px-4 md:px-6">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
              <Send size={28} className="text-secondary" />
            </div>
            <h1 className="mb-4 text-headline-lg text-primary">{t("successTitle")}</h1>
            <p className="text-body-md text-on-surface-variant">{t("successBody")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-3 text-headline-xl text-primary">{t("title")}</h1>
          <p className="mb-10 text-body-md text-on-surface-variant">{t("description")}</p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Honeypot — hidden from humans */}
            <div aria-hidden="true" className="absolute -left-[9999px]" tabIndex={-1}>
              <input
                id="hp-field"
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
            </div>

            <Input
              label={t("nameLabel")}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={18} />}
              error={errors.name}
              required
              autoComplete="name"
            />

            <Input
              label={t("emailLabel")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              error={errors.email}
              required
              autoComplete="email"
            />

            <div>
              <label htmlFor="subject" className="mb-2 block text-label-md font-medium text-on-surface">
                {t("subjectLabel")}
              </label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {t(
                      `subject${s.charAt(0).toUpperCase() + s.slice(1).replace(/-./g, (m) => m[1].toUpperCase())}`
                    )}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-label-md font-medium text-on-surface">
                {t("messageLabel")}
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`w-full rounded-lg border bg-surface px-4 py-3 text-body-md text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.message ? "border-error" : "border-outline-variant focus:border-primary"
                }`}
              />
              {errors.message ? (
                <p id="message-error" role="alert" className="mt-1 text-label-md text-error">
                  {errors.message}
                </p>
              ) : null}
            </div>

            {errors.form ? (
              <p
                role="alert"
                className="rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container"
              >
                {errors.form}
              </p>
            ) : null}

            <Button type="submit" loading={submitting} fullWidth>
              {t("submitButton")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
