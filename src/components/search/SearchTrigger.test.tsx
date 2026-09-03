// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { SearchTrigger, getShortcutLabel } from "./SearchTrigger";

describe("getShortcutLabel", () => {
  const mockT = vi.fn((key: string) => {
    if (key === "shortcutMac") return "⌘K";
    if (key === "shortcutWindows") return "Ctrl+K";
    return key;
  }) as any;

  let originalNavigator: Navigator;

  beforeEach(() => {
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns shortcutWindows when navigator is undefined", () => {
    vi.stubGlobal("navigator", undefined);
    expect(getShortcutLabel(mockT)).toBe("Ctrl+K");
    expect(mockT).toHaveBeenCalledWith("shortcutWindows");
  });

  it("uses navigator.userAgentData.platform when available and handles Mac platforms", () => {
    const platforms = ["macOS", "iPhone", "iPad", "MacIntel"];
    for (const platform of platforms) {
      vi.stubGlobal("navigator", {
        userAgentData: { platform },
        platform: "Other",
      });
      expect(getShortcutLabel(mockT)).toBe("⌘K");
    }
  });

  it("uses navigator.userAgentData.platform when available and handles non-Mac platforms", () => {
    const platforms = ["Windows", "Linux", "Android"];
    for (const platform of platforms) {
      vi.stubGlobal("navigator", {
        userAgentData: { platform },
        platform: "MacIntel",
      });
      expect(getShortcutLabel(mockT)).toBe("Ctrl+K");
    }
  });

  it("falls back to navigator.platform when userAgentData is undefined", () => {
    vi.stubGlobal("navigator", {
      platform: "MacIntel",
    });
    expect(getShortcutLabel(mockT)).toBe("⌘K");

    vi.stubGlobal("navigator", {
      platform: "Win32",
    });
    expect(getShortcutLabel(mockT)).toBe("Ctrl+K");
  });

  it("handles empty or missing platform properties gracefully", () => {
    vi.stubGlobal("navigator", {
      userAgentData: {},
      platform: "",
    });
    expect(getShortcutLabel(mockT)).toBe("Ctrl+K");
  });
});

describe("SearchTrigger component", () => {
  const mockT = vi.fn((key: string) => {
    const map: Record<string, string> = {
      openSearch: "Open search",
      placeholder: "Search topics...",
    };
    return map[key] || key;
  }) as any;

  const mockSetIsOpen = vi.fn();
  const triggerRef = React.createRef<HTMLButtonElement>();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger button with correct attributes and shortcut label", () => {
    render(<SearchTrigger triggerRef={triggerRef} setIsOpen={mockSetIsOpen} t={mockT} shortcutLabel="⌘K" />);

    const button = screen.getByRole("button", { name: "Open search" });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Search topics...")).toBeInTheDocument();
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("does not render shortcut kbd element when shortcutLabel is null", () => {
    render(
      <SearchTrigger triggerRef={triggerRef} setIsOpen={mockSetIsOpen} t={mockT} shortcutLabel={null} />
    );

    expect(screen.queryByText("⌘K")).not.toBeInTheDocument();
  });

  it("calls setIsOpen(true) when clicked", () => {
    render(<SearchTrigger triggerRef={triggerRef} setIsOpen={mockSetIsOpen} t={mockT} shortcutLabel="⌘K" />);

    const button = screen.getByRole("button", { name: "Open search" });
    fireEvent.click(button);
    expect(mockSetIsOpen).toHaveBeenCalledWith(true);
  });
});
