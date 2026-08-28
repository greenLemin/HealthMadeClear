// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { shareCurrentPage } from "./shareCurrentPage";

const url = "https://healthmadeclear.com/en/learn/reading-nutrition-labels";
const title = "Reading a Nutrition Label";

function stubNavigator({ share, writeText }: { share?: unknown; writeText?: ReturnType<typeof vi.fn> }) {
  Object.defineProperty(navigator, "share", {
    configurable: true,
    writable: true,
    value: share,
  });
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    writable: true,
    value: writeText ? { writeText } : undefined,
  });
}

describe("shareCurrentPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls navigator.share when present and does not write the clipboard", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ share, writeText });
    const onCopied = vi.fn();
    const onError = vi.fn();

    await shareCurrentPage({ url, title, onCopied, onError });

    expect(share).toHaveBeenCalledWith({ url, title });
    expect(writeText).not.toHaveBeenCalled();
    expect(onCopied).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("does not error-toast on AbortError from navigator.share", async () => {
    const abort = new DOMException("Share canceled", "AbortError");
    const writeText = vi.fn();
    stubNavigator({ share: vi.fn().mockRejectedValue(abort), writeText });
    const onError = vi.fn();

    await shareCurrentPage({ url, title, onError });

    expect(onError).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies to the clipboard and success-toasts when navigator.share is missing", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ share: undefined, writeText });
    const onCopied = vi.fn();
    const onError = vi.fn();

    await shareCurrentPage({ url, title, onCopied, onError });

    expect(writeText).toHaveBeenCalledWith(url);
    expect(onCopied).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("error-toasts when clipboard write fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    stubNavigator({ share: undefined, writeText });
    const onCopied = vi.fn();
    const onError = vi.fn();

    await shareCurrentPage({ url, title, onCopied, onError });

    expect(onCopied).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
