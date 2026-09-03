// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import React, { createRef } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { SearchTrigger, getShortcutLabel } from "./SearchTrigger";

describe("SearchTrigger", () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      openSearch: "Open search",
      placeholder: "Search topics...",
      shortcutMac: "⌘K",
      shortcutWindows: "Ctrl+K",
    };
    return translations[key] || key;
  }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getShortcutLabel", () => {
    const originalNavigator = globalThis.navigator;

    afterEach(() => {
      Object.defineProperty(globalThis, "navigator", {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    });

    it("returns shortcutWindows when navigator is undefined (SSR environment)", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const result = getShortcutLabel(mockT);
      expect(result).toBe("Ctrl+K");
      expect(mockT).toHaveBeenCalledWith("shortcutWindows");
    });

    it("returns shortcutMac when userAgentData.platform indicates Mac", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {
          userAgentData: { platform: "macOS" },
          platform: "Win32",
        },
        writable: true,
        configurable: true,
      });

      const result = getShortcutLabel(mockT);
      expect(result).toBe("⌘K");
      expect(mockT).toHaveBeenCalledWith("shortcutMac");
    });

    it("returns shortcutMac when navigator.platform indicates Mac or iOS device", () => {
      const macPlatforms = ["MacIntel", "MacPPC", "iPhone", "iPad"];

      for (const platform of macPlatforms) {
        Object.defineProperty(globalThis, "navigator", {
          value: { platform },
          writable: true,
          configurable: true,
        });

        const result = getShortcutLabel(mockT);
        expect(result).toBe("⌘K");
      }
    });

    it("returns shortcutWindows when navigator.platform indicates a non-Mac platform", () => {
      const nonMacPlatforms = ["Win32", "Linux x86_64", "Android"];

      for (const platform of nonMacPlatforms) {
        Object.defineProperty(globalThis, "navigator", {
          value: { platform },
          writable: true,
          configurable: true,
        });

        const result = getShortcutLabel(mockT);
        expect(result).toBe("Ctrl+K");
      }
    });
  });

  describe("SearchTrigger Component", () => {
    it("renders button with correct aria-label, type, and placeholder text", () => {
      const triggerRef = createRef<HTMLButtonElement>();
      const setIsOpen = vi.fn();

      render(<SearchTrigger triggerRef={triggerRef} setIsOpen={setIsOpen} t={mockT} shortcutLabel="⌘K" />);

      const button = screen.getByRole("button", { name: "Open search" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "button");
      expect(screen.getByText("Search topics...")).toBeInTheDocument();
    });

    it("attaches triggerRef to the button element", () => {
      const triggerRef = createRef<HTMLButtonElement>();
      const setIsOpen = vi.fn();

      render(<SearchTrigger triggerRef={triggerRef} setIsOpen={setIsOpen} t={mockT} shortcutLabel="⌘K" />);

      expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
      expect(triggerRef.current).toBe(screen.getByRole("button", { name: "Open search" }));
    });

    it("calls setIsOpen(true) when clicked", () => {
      const triggerRef = createRef<HTMLButtonElement>();
      const setIsOpen = vi.fn();

      render(<SearchTrigger triggerRef={triggerRef} setIsOpen={setIsOpen} t={mockT} shortcutLabel="⌘K" />);

      const button = screen.getByRole("button", { name: "Open search" });
      fireEvent.click(button);

      expect(setIsOpen).toHaveBeenCalledTimes(1);
      expect(setIsOpen).toHaveBeenCalledWith(true);
    });

    it("renders shortcutLabel kbd badge when shortcutLabel is provided", () => {
      const triggerRef = createRef<HTMLButtonElement>();
      const setIsOpen = vi.fn();

      render(
        <SearchTrigger triggerRef={triggerRef} setIsOpen={setIsOpen} t={mockT} shortcutLabel="Ctrl+K" />
      );

      const kbd = screen.getByText("Ctrl+K");
      expect(kbd).toBeInTheDocument();
      expect(kbd.tagName.toLowerCase()).toBe("kbd");
    });

    it("does not render kbd badge when shortcutLabel is null", () => {
      const triggerRef = createRef<HTMLButtonElement>();
      const setIsOpen = vi.fn();

      const { container } = render(
        <SearchTrigger triggerRef={triggerRef} setIsOpen={setIsOpen} t={mockT} shortcutLabel={null} />
      );

      expect(container.querySelector("kbd")).toBeNull();
    });
  });
});
