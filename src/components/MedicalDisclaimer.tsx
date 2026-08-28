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
        <div className="mt-4 md:mt-0">
          <a
            href="tel:911"
            className={getButtonClasses({ className: "inline-flex items-center justify-center" })}
            aria-label={t("emergencyCallAria")}
          >
            {t("emergencyCall")}
          </a>
          <p className="mt-2 text-label-md text-on-error-container">{t("emergencyRegionNote")}</p>
        </div>
      </div>
    );
  }

  return <p className={`text-body-md text-on-surface-variant ${className}`}>{t("educational")}</p>;
}
