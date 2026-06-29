import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("forgotPasswordTitle"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
      <div className="surface-card-glass mx-auto max-w-2xl p-6 md:p-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
