import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/i18n";

type Variant = "inline" | "emergency";

export default function MedicalDisclaimer({
  locale = "en",
  variant = "inline",
  className = "",
}: {
  locale?: Locale;
  variant?: Variant;
  className?: string;
}) {
  const copy = getMessages(locale);

  if (variant === "emergency") {
    return (
      <div
        className={`rounded-2xl border border-error bg-error-container p-6 md:flex md:items-center md:justify-between md:gap-6 ${className}`}
      >
        <div>
          <h2 className="mb-2 text-label-lg text-error">{copy.disclaimer.emergencyTitle}</h2>
          <p className="text-body-md text-on-error-container">{copy.disclaimer.emergencyBody}</p>
        </div>
        <a
          href="tel:911"
          className="btn-primary mt-4 inline-flex items-center justify-center md:mt-0"
          aria-label={copy.disclaimer.emergencyCallAria}
        >
          {copy.disclaimer.emergencyCall}
        </a>
      </div>
    );
  }

  return (
    <p className={`text-body-md text-on-surface-variant ${className}`}>{copy.disclaimer.educational}</p>
  );
}
