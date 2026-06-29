"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Mail, User, MessageSquare, Send, Clock3, ShieldCheck, Accessibility } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const SUBJECTS = ["general", "content-feedback", "accessibility-issue", "privacy-request", "other"] as const;

export default function ContactClient() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supportNotes =
    locale === "es"
      ? [
          {
            title: "Respuesta humana",
            body: "Respondemos mensajes generales y comentarios de contenido en aproximadamente 2 días hábiles.",
            icon: Clock3,
          },
          {
            title: "Ayuda de accesibilidad",
            body: "Usa este formulario para reportar barreras de lectura, navegación o uso del sitio.",
            icon: Accessibility,
          },
          {
            title: "Solicitudes de privacidad",
            body: "También puedes usar este canal para preguntas sobre datos, almacenamiento local y preferencias.",
            icon: ShieldCheck,
          },
        ]
      : [
          {
            title: "Human response",
            body: "We review general questions and content feedback within about 2 business days.",
            icon: Clock3,
          },
          {
            title: "Accessibility help",
            body: "Use this form to report reading, navigation, or interaction barriers in the site experience.",
            icon: Accessibility,
          },
          {
            title: "Privacy requests",
            body: "This channel also works for questions about data, local storage, and account preferences.",
            icon: ShieldCheck,
          },
        ];

  function handleNameChange(value: string) {
    setName(value);
    setErrors((prev) => ({ ...prev, name: "", form: "" }));
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: "", form: "" }));
  }

  function handleSubjectChange(value: string) {
    setSubject(value);
    setErrors((prev) => ({ ...prev, form: "" }));
  }

  function handleMessageChange(value: string) {
    setMessage(value);
    setErrors((prev) => ({ ...prev, message: "", form: "" }));
  }

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
          <Reveal>
            <div className="section-frame mx-auto max-w-2xl px-6 py-8 text-center md:px-10 md:py-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container shadow-elevation-1">
                <Send size={28} className="text-secondary" />
              </div>
              <div className="eyebrow mb-3">{t("submitButton")}</div>
              <h1 className="font-display text-headline-lg text-primary">{t("successTitle")}</h1>
              <p className="mt-4 text-body-md text-on-surface-variant">{t("successBody")}</p>
            </div>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <PageHeader centered title={t("title")} description={t("description")} className="mb-8" />

        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="space-y-4">
            {supportNotes.map((note, index) => {
              const Icon = note.icon;
              return (
                <Reveal key={note.title} delay={Math.min(index * 0.05, 0.12)}>
                  <article className="surface-card px-5 py-5 md:px-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-primary shadow-elevation-1">
                      <Icon size={18} />
                    </div>
                    <h2 className="mt-4 font-display text-headline-sm text-primary">{note.title}</h2>
                    <p className="mt-2 text-body-md text-on-surface-variant">{note.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <div className="surface-card-glass px-6 py-6 md:px-8 md:py-8">
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div aria-hidden="true" className="absolute -left-[9999px]" tabIndex={-1}>
                  <label htmlFor="hp-field">Leave this empty</label>
                  <input
                    id="hp-field"
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={t("nameLabel")}
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    icon={<User size={18} />}
                    error={errors.name}
                    required
                    autoComplete="name"
                  />

                  <Input
                    label={t("emailLabel")}
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    icon={<Mail size={18} />}
                    error={errors.email}
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="mb-2 block text-label-md font-medium text-on-surface">
                    {t("subjectLabel")}
                  </label>
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="input-field"
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
                  <div className="relative">
                    <MessageSquare
                      className="pointer-events-none absolute left-4 top-4 text-on-surface-variant"
                      size={18}
                    />
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => handleMessageChange(e.target.value)}
                      rows={7}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      className={`input-field min-h-48 pl-11 align-top ${
                        errors.message ? "border-error focus:ring-error/20" : ""
                      }`}
                    />
                  </div>
                  {errors.message ? (
                    <p id="message-error" role="alert" className="mt-1 text-label-md text-error">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                {errors.form ? (
                  <p
                    role="alert"
                    className="rounded-[1.2rem] bg-error-container px-4 py-3 text-label-md text-on-error-container"
                  >
                    {errors.form}
                  </p>
                ) : null}

                <Button type="submit" loading={submitting} fullWidth>
                  {t("submitButton")}
                </Button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
