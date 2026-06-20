"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface ToastData {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "border-l-secondary bg-secondary-container/60",
  error: "border-l-error bg-error-container",
  info: "border-l-primary bg-primary-fixed/30",
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={20} className="text-secondary" />,
  error: <XCircle size={20} className="text-error" />,
  info: <Info size={20} className="text-primary" />,
};

export default function ToastItem({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(show);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 8000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        "flex items-start gap-3 rounded-xl border-l-4 border-outline-variant bg-surface p-4 shadow-elevation-2 transition-all duration-300 motion-reduce:transition-none",
        variantStyles[toast.variant],
        visible ? "motion-safe:translate-x-0 opacity-100" : "motion-safe:translate-x-full opacity-0",
      ].join(" ")}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {variantIcons[toast.variant]}
      </span>
      <p className="flex-1 text-body-md text-on-surface">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export type { ToastData, ToastVariant };
