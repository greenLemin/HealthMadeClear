import { useEffect } from "react";

type Options = {
  isOpen: boolean;
  onClose: () => void;
  containerRef: React.RefObject<HTMLElement | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
  lockBodyScroll?: boolean;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
};

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        (returnFocusRef ?? triggerRef)?.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    if (lockBodyScroll) document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      if (lockBodyScroll) document.body.style.overflow = "";
    };
  }, [isOpen, onClose, containerRef, triggerRef, lockBodyScroll, returnFocusRef]);
}
