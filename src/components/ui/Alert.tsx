"use client";

import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<
  AlertVariant,
  { container: string; border: string; title: string; body: string; icon: ReactNode }
> = {
  info: {
    container: "bg-primary-fixed/30",
    border: "border-l-primary",
    title: "text-primary",
    body: "text-on-surface-variant",
    icon: <Info size={20} />,
  },
  success: {
    container: "bg-secondary-container/60",
    border: "border-l-secondary",
    title: "text-secondary",
    body: "text-on-surface-variant",
    icon: <CheckCircle2 size={20} />,
  },
  warning: {
    container: "bg-tertiary-container/30",
    border: "border-l-tertiary",
    title: "text-tertiary",
    body: "text-on-surface-variant",
    icon: <AlertTriangle size={20} />,
  },
  error: {
    container: "bg-error-container",
    border: "border-l-error",
    title: "text-error",
    body: "text-on-error-container",
    icon: <XCircle size={20} />,
  },
};

export default function Alert({
  variant = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  className = "",
}: AlertProps) {
  const styles = variantStyles[variant];
  const tCommon = useTranslations("common");

  return (
    <div
      role="alert"
      className={["rounded-2xl border-l-4 p-5", styles.container, styles.border, className].join(" ")}
    >
      <div className="flex gap-4">
        <div className={`mt-0.5 shrink-0 ${styles.title}`} aria-hidden="true">
          {styles.icon}
        </div>
        <div className="min-w-0 flex-1">
          {title ? <p className={`mb-1 text-label-lg ${styles.title}`}>{title}</p> : null}
          <div className={`text-body-md ${styles.body}`}>{children}</div>
        </div>
        {dismissible && onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            aria-label={tCommon("dismiss")}
          >
            <X size={18} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export type { AlertVariant, AlertProps };
