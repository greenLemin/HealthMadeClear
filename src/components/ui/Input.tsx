"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: ReactNode;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      required = false,
      icon,
      id,
      type = "text",
      className = "",
      showPasswordLabel = "Show password",
      hidePasswordLabel = "Hide password",
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const isPassword = type === "password";
    const [revealed, setRevealed] = useState(false);
    const effectiveType = isPassword && revealed ? "text" : type;

    return (
      <div className="w-full">
        <label htmlFor={inputId} className="mb-2 block text-label-md text-on-surface">
          {label}
          {required ? (
            <span className="ml-1 text-error" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        <div className="relative">
          {icon ? (
            <div
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              aria-hidden="true"
            >
              {icon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            required={required}
            aria-required={required || undefined}
            aria-invalid={!!error}
            aria-describedby={
              [error ? errorId : null, hint && !error ? hintId : null].filter(Boolean).join(" ") || undefined
            }
            className={[
              "w-full rounded-xl border-2 bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-all duration-200",
              icon ? "pl-12" : "",
              isPassword ? "pr-12" : "",
              error
                ? "border-error focus:border-error focus:ring-4 focus:ring-error/15"
                : "border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/15",
              "focus:outline-none",
              className,
            ].join(" ")}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((current) => !current)}
              aria-pressed={revealed}
              aria-label={revealed ? hidePasswordLabel : showPasswordLabel}
              className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {revealed ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          ) : null}
        </div>
        {error ? (
          <p id={errorId} role="alert" className="mt-2 flex items-center gap-1.5 text-label-md text-error">
            <AlertCircle size={16} aria-hidden="true" />
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-2 text-label-md text-on-surface-variant">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

export type { InputProps };
