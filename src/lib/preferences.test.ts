// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { applyDocumentPreferences } from "./preferences";

describe("applyDocumentPreferences", () => {
  beforeEach(() => {
    // Reset document element attributes
    document.documentElement.lang = "";
    document.documentElement.dataset.locale = "";
    document.documentElement.dataset.theme = "";
    document.documentElement.dataset.textSize = "";
    document.documentElement.dataset.simpleMode = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("applies light theme, standard text size, non-simple mode, English locale", () => {
    applyDocumentPreferences("en", "light", "standard", false);

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dataset.locale).toBe("en");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.textSize).toBe("standard");
    expect(document.documentElement.dataset.simpleMode).toBe("false");
  });

  it("applies dark theme, large text size, simple mode, Spanish locale", () => {
    applyDocumentPreferences("es", "dark", "large", true);

    expect(document.documentElement.lang).toBe("es");
    expect(document.documentElement.dataset.locale).toBe("es");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.textSize).toBe("large");
    expect(document.documentElement.dataset.simpleMode).toBe("true");
  });

  it("does nothing when document is undefined", () => {
    // Mock the global document to be undefined specifically for this test
    const originalDocument = global.document;
    // @ts-ignore
    delete global.document;

    // This should not throw an error
    expect(() => {
      applyDocumentPreferences("en", "light", "standard", false);
    }).not.toThrow();

    // Restore document
    global.document = originalDocument;
  });
});
