// @vitest-environment jsdom
import { renderHook, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { type RefObject } from "react";

describe("useDismissibleOverlay", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = "";
    document.body.innerHTML = "";
    cleanup();
  });

  const setupDOM = () => {
    const container = document.createElement("div");
    const containerInside = document.createElement("button");
    container.appendChild(containerInside);

    const trigger = document.createElement("button");
    const returnFocus = document.createElement("button");
    const outside = document.createElement("button");

    document.body.appendChild(container);
    document.body.appendChild(trigger);
    document.body.appendChild(returnFocus);
    document.body.appendChild(outside);

    // A plain object satisfies RefObject and stays writable, unlike createRef
    // whose `current` is readonly.
    const containerRef: RefObject<HTMLElement | null> = { current: container };
    const triggerRef: RefObject<HTMLElement | null> = { current: trigger };
    const returnFocusRef: RefObject<HTMLElement | null> = { current: returnFocus };

    return {
      container,
      containerInside,
      trigger,
      returnFocus,
      outside,
      containerRef,
      triggerRef,
      returnFocusRef,
    };
  };

  it("does nothing when not open", () => {
    const { outside, containerRef, triggerRef } = setupDOM();
    const onClose = vi.fn();

    renderHook(() =>
      useDismissibleOverlay({
        isOpen: false,
        onClose,
        containerRef,
        triggerRef,
      })
    );

    fireEvent.mouseDown(outside);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when clicking outside", () => {
    const { outside, containerRef, triggerRef } = setupDOM();
    const onClose = vi.fn();

    renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose,
        containerRef,
        triggerRef,
      })
    );

    fireEvent.mouseDown(outside);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose when clicking inside the container", () => {
    const { container, containerInside, containerRef, triggerRef } = setupDOM();
    const onClose = vi.fn();

    renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose,
        containerRef,
        triggerRef,
      })
    );

    fireEvent.mouseDown(containerInside);
    fireEvent.mouseDown(container);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not call onClose when clicking the trigger", () => {
    const { trigger, containerRef, triggerRef } = setupDOM();
    const onClose = vi.fn();

    renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose,
        containerRef,
        triggerRef,
      })
    );

    fireEvent.mouseDown(trigger);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose and focuses triggerRef when Escape is pressed", () => {
    const { trigger, containerRef, triggerRef } = setupDOM();
    const onClose = vi.fn();

    renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose,
        containerRef,
        triggerRef,
      })
    );

    const focusSpy = vi.spyOn(trigger, "focus");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
    expect(focusSpy).toHaveBeenCalledOnce();
  });

  it("calls onClose and focuses returnFocusRef when Escape is pressed and returnFocusRef is provided", () => {
    const { trigger, returnFocus, containerRef, triggerRef, returnFocusRef } = setupDOM();
    const onClose = vi.fn();

    renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose,
        containerRef,
        triggerRef,
        returnFocusRef,
      })
    );

    const triggerFocusSpy = vi.spyOn(trigger, "focus");
    const returnFocusSpy = vi.spyOn(returnFocus, "focus");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
    expect(returnFocusSpy).toHaveBeenCalledOnce();
    expect(triggerFocusSpy).not.toHaveBeenCalled();
  });

  it("locks and unlocks body scroll when lockBodyScroll is true", () => {
    const { containerRef, triggerRef } = setupDOM();
    const onClose = vi.fn();

    const { unmount } = renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose,
        containerRef,
        triggerRef,
        lockBodyScroll: true,
      })
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("does not call onClose when a key other than Escape is pressed", () => {
    const { containerRef, triggerRef } = setupDOM();
    const onClose = vi.fn();

    renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose,
        containerRef,
        triggerRef,
      })
    );

    fireEvent.keyDown(document, { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("handles multiple instances locking and unlocking body scroll correctly", () => {
    const { containerRef, triggerRef } = setupDOM();
    const onClose1 = vi.fn();
    const onClose2 = vi.fn();

    const { unmount: unmount1 } = renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose: onClose1,
        containerRef,
        triggerRef,
        lockBodyScroll: true,
      })
    );
    expect(document.body.style.overflow).toBe("hidden");

    const { unmount: unmount2 } = renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose: onClose2,
        containerRef,
        triggerRef,
        lockBodyScroll: true,
      })
    );
    expect(document.body.style.overflow).toBe("hidden");

    unmount2();
    expect(document.body.style.overflow).toBe("hidden"); // Still locked by the first instance

    unmount1();
    expect(document.body.style.overflow).toBe(""); // Unlocked after both are unmounted
  });

  it("does not lock body scroll when lockBodyScroll is false", () => {
    const { containerRef, triggerRef } = setupDOM();
    const onClose = vi.fn();

    renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose,
        containerRef,
        triggerRef,
        lockBodyScroll: false,
      })
    );

    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("restores previous body overflow when unlocked", () => {
    document.body.style.overflow = "scroll";
    const { containerRef, triggerRef } = setupDOM();
    const onClose = vi.fn();

    const { unmount } = renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose,
        containerRef,
        triggerRef,
        lockBodyScroll: true,
      })
    );

    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("functions correctly without a triggerRef", () => {
    const { outside, containerRef } = setupDOM();
    const onClose = vi.fn();

    renderHook(() =>
      useDismissibleOverlay({
        isOpen: true,
        onClose,
        containerRef,
      })
    );

    // Clicking outside should call onClose without errors
    fireEvent.mouseDown(outside);
    expect(onClose).toHaveBeenCalledOnce();

    onClose.mockClear();

    // Escape should call onClose without trying to focus a missing triggerRef
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
