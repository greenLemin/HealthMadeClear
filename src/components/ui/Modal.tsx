"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { modalVariants, revealEase } from "@/components/ui/Reveal";
import { useTranslations } from "next-intl";

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
  const tCommon = useTranslations("common");
  const motionSafe = useMotionSafe();

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

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {motionSafe ? (
            <div
              className="fixed inset-0 bg-black/45 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: revealEase }}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />
          )}
          {motionSafe ? (
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className={["surface-card-glass relative z-10 w-full p-6 md:p-8", sizeStyles[size]].join(" ")}
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 id={titleId} className="font-display text-headline-md text-primary">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant transition-all duration-300 ease-premium hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={tCommon("dismiss")}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              {children}
            </div>
          ) : (
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, ease: revealEase }}
              className={["surface-card-glass relative z-10 w-full p-6 md:p-8", sizeStyles[size]].join(" ")}
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 id={titleId} className="font-display text-headline-md text-primary">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant transition-all duration-300 ease-premium hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={tCommon("dismiss")}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              {children}
            </motion.div>
          )}
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export type { ModalProps, ModalSize };
