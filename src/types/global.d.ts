declare interface Window {
  gtag?: (command: string, ...args: unknown[]) => void;
  plausible?: (event: string, options?: { props?: Record<string, unknown>; u?: string }) => void;
  dataLayer?: unknown[];
}
