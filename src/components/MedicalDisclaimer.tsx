"use client";

import { useTranslations } from "next-intl";
import { getButtonClasses } from "@/components/ui/buttonStyles";

type Variant = "inline" | "emergency";

export default function MedicalDisclaimer({
  variant = "inline",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const t = useTranslations("disclaimer");

  if (variant === "emergency") {
    return (
      <div
        className={`rounded-2xl border border-error bg-error-container p-6 md:flex md:items-center md:justify-between md:gap-6 ${className}`}
      >
        <div>
          <h2 className="mb-2 text-label-lg text-error">{t("emergencyTitle")}</h2>
          <p className="text-body-md text-on-error-container">{t("emergencyBody")}</p>
        </div>
        <a
          href="tel:911"
          className={getButtonClasses({ className: "mt-4 inline-flex items-center justify-center md:mt-0" })}
          aria-label={t("emergencyCallAria")}
        >
          {t("emergencyCall")}
        </a>
      </div>
    );
  }

  return <p className={`text-body-md text-on-surface-variant ${className}`}>{t("educational")}</p>;
}
