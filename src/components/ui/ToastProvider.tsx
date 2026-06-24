"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import ToastItem from "@/components/ui/Toast";
import type { ToastVariant } from "@/components/ui/Toast";

interface ToastContextValue {
  showToast: (variant: ToastVariant, message: string) => void;
}

interface ToastData {
  id: string;
  variant: ToastVariant;
  message: string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((variant: ToastVariant, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { id, variant, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[120] flex w-full max-w-sm flex-col gap-3"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
