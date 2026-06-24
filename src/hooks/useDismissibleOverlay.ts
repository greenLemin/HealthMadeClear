import { useEffect, type RefObject } from "react";

type Options = {
  isOpen: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
  lockBodyScroll?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

let scrollLockCount = 0;
let previousBodyOverflow = "";

function lockScroll() {
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  scrollLockCount += 1;
}

function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
  }
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
