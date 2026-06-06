// @vitest-environment jsdom
import { render, fireEvent, cleanup } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";

function Fixture({
  isOpen = true,
  onClose,
  lockBodyScroll = false,
  useReturnFocus = false,
}: {
  isOpen?: boolean;
  onClose: () => void;
  lockBodyScroll?: boolean;
  useReturnFocus?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);

  useDismissibleOverlay({
    isOpen,
    onClose,
    containerRef,
    triggerRef,
    lockBodyScroll,
    returnFocusRef: useReturnFocus ? returnFocusRef : undefined,
  });

  return (
    <div>
      <button ref={triggerRef} type="button" data-testid="trigger">
        Trigger
      </button>
      <button ref={returnFocusRef} type="button" data-testid="return-focus">
        Return Focus
      </button>
      <div ref={containerRef} data-testid="container">
        <p>Overlay Content</p>
        <button data-testid="inside">Inside</button>
      </div>
      <button data-testid="outside">Outside</button>
    </div>
  );
}

describe("useDismissibleOverlay", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = "";
    cleanup();
  });

  it("does nothing when not open", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(<Fixture isOpen={false} onClose={onClose} />);

    fireEvent.mouseDown(getByTestId("outside"));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when clicking outside", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(<Fixture onClose={onClose} />);

    fireEvent.mouseDown(getByTestId("outside"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose when clicking inside the container", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(<Fixture onClose={onClose} />);

    fireEvent.mouseDown(getByTestId("inside"));
    fireEvent.mouseDown(getByTestId("container"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not call onClose when clicking the trigger", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(<Fixture onClose={onClose} />);

    fireEvent.mouseDown(getByTestId("trigger"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose and focuses triggerRef when Escape is pressed", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(<Fixture onClose={onClose} />);

    const trigger = getByTestId("trigger");
    const focusSpy = vi.spyOn(trigger, "focus");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
    expect(focusSpy).toHaveBeenCalledOnce();
  });

  it("calls onClose and focuses returnFocusRef when Escape is pressed and returnFocusRef is provided", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(<Fixture onClose={onClose} useReturnFocus />);

    const trigger = getByTestId("trigger");
    const returnFocus = getByTestId("return-focus");
    const triggerFocusSpy = vi.spyOn(trigger, "focus");
    const returnFocusSpy = vi.spyOn(returnFocus, "focus");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
    expect(returnFocusSpy).toHaveBeenCalledOnce();
    expect(triggerFocusSpy).not.toHaveBeenCalled();
  });

  it("locks and unlocks body scroll when lockBodyScroll is true", () => {
    const onClose = vi.fn();
    const { unmount } = render(<Fixture onClose={onClose} lockBodyScroll />);

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("does not lock body scroll when lockBodyScroll is false", () => {
    const onClose = vi.fn();
    render(<Fixture onClose={onClose} lockBodyScroll={false} />);

    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
