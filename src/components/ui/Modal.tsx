"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-${title.toLowerCase().replace(/\s+/g, "-")}`;

  useFocusTrap(dialogRef, isOpen);

  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm motion-safe:animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          "relative z-10 w-full rounded-xl border border-outline-variant bg-surface p-6 shadow-elevation-3 motion-safe:animate-fadeIn md:p-8",
          sizeStyles[size],
        ].join(" ")}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-headline-md text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export type { ModalProps, ModalSize };
