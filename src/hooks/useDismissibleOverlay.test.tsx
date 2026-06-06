// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";

function OverlayFixture({
  isOpen,
  onClose,
  lockBodyScroll = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  lockBodyScroll?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  useDismissibleOverlay({ isOpen, onClose, containerRef, triggerRef, lockBodyScroll, returnFocusRef });

  return (
    <div>
      <button ref={triggerRef} type="button" data-testid="trigger-btn">
        Trigger
      </button>
      <button ref={returnFocusRef} type="button" data-testid="focus-btn">
        ReturnFocus
      </button>
      {isOpen && (
        <div ref={containerRef} data-testid="overlay">
          <button type="button" data-testid="inside-btn">
            Inside
          </button>
        </div>
      )}
    </div>
  );
}

describe("useDismissibleOverlay", () => {
  it("calls onClose when pressing Escape", () => {
    const onClose = vi.fn();
    const { unmount } = render(<OverlayFixture isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("calls onClose when clicking outside the container", () => {
    const onClose = vi.fn();
    const { unmount } = render(<OverlayFixture isOpen={true} onClose={onClose} />);

    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("does not call onClose when clicking inside the container", () => {
    const onClose = vi.fn();
    const { unmount } = render(<OverlayFixture isOpen={true} onClose={onClose} />);

    fireEvent.mouseDown(screen.getByTestId("inside-btn"));
    expect(onClose).not.toHaveBeenCalled();
    unmount();
  });

  it("does not call onClose when clicking the trigger", () => {
    const onClose = vi.fn();
    const { unmount } = render(<OverlayFixture isOpen={true} onClose={onClose} />);

    fireEvent.mouseDown(screen.getByTestId("trigger-btn"));
    expect(onClose).not.toHaveBeenCalled();
    unmount();
  });

  it("locks and unlocks body scroll", () => {
    const onClose = vi.fn();
    const { unmount } = render(<OverlayFixture isOpen={true} onClose={onClose} lockBodyScroll />);

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });
});
