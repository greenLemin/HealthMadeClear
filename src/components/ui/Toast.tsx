"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const AUTO_DISMISS_MS = 8000;

export default function ToastItem({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isError = toast.variant === "error";

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(show);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, AUTO_DISMISS_MS);
  }, [toast.id, onDismiss]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onFocus={pauseTimer}
      onBlur={startTimer}
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
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Dismiss notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export type { ToastData, ToastVariant };
