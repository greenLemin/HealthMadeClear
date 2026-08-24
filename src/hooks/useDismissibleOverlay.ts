import { useEffect, type RefObject } from "react";
import { lockScroll as sharedLockScroll, unlockScroll as sharedUnlockScroll } from "@/lib/scrollLock";

type Options = {
  isOpen: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
  lockBodyScroll?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export function lockScroll() {
  sharedLockScroll();
}

export function unlockScroll() {
  sharedUnlockScroll();
}

export function useDismissibleOverlay({
  isOpen,
  onClose,
  containerRef,
  triggerRef,
  lockBodyScroll = false,
  returnFocusRef,
}: Options) {
  useEffect(() => {
    if (!isOpen) return;

    const restoreFocus = () => {
      (returnFocusRef ?? triggerRef)?.current?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        restoreFocus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      onClose();
      restoreFocus();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    if (lockBodyScroll) lockScroll();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      if (lockBodyScroll) unlockScroll();
    };
  }, [isOpen, onClose, containerRef, triggerRef, lockBodyScroll, returnFocusRef]);
}
