export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const ghostStyles =
  "inline-flex items-center justify-center gap-2 border border-transparent bg-transparent font-semibold text-on-surface transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-surface-container hover:text-primary active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none";

const dangerStyles =
  "inline-flex items-center justify-center gap-2 border border-error/20 bg-error font-semibold text-on-error shadow-elevation-1 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-error/90 hover:shadow-elevation-2 active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none";

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-11 rounded-full px-4 py-2 text-label-md",
  md: "min-h-[56px] rounded-full px-6 py-3 text-label-lg",
  lg: "min-h-[64px] rounded-full px-8 py-4 text-label-lg",
};

const sharedInteractive =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none motion-reduce:transition-none";

type ButtonClassOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export function getButtonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: ButtonClassOptions): string {
  const variantClass =
    variant === "primary"
      ? `btn-primary ${sharedInteractive} focus-visible:ring-primary`
      : variant === "secondary"
        ? `btn-secondary ${sharedInteractive} focus-visible:ring-primary`
        : variant === "ghost"
          ? `${ghostStyles} ${sizeStyles[size]}`
          : `${dangerStyles} ${sizeStyles[size]}`;

  const sizeClass = variant === "primary" || variant === "secondary" ? sizeStyles[size] : "";

  return [variantClass, sizeClass, fullWidth ? "w-full" : "", className].filter(Boolean).join(" ");
}
