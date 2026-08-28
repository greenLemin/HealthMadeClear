export type ShareCurrentPageOptions = {
  url: string;
  title: string;
  onCopied?: () => void;
  onError?: () => void;
};

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return "name" in error && error.name === "AbortError";
}

export async function shareCurrentPage({
  url,
  title,
  onCopied,
  onError,
}: ShareCurrentPageOptions): Promise<void> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ url, title });
    } catch (error) {
      if (isAbortError(error)) return;
      onError?.();
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    onCopied?.();
  } catch {
    onError?.();
  }
}
