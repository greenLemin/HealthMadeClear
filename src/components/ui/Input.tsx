"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required = false, icon, id, className = "", ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

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
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {icon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              [error ? errorId : null, hint && !error ? hintId : null].filter(Boolean).join(" ") || undefined
            }
            className={[
              "w-full rounded-lg border-[1.5px] bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant transition-colors",
              icon ? "pl-12" : "",
              error
                ? "border-error focus:border-error focus:ring-2 focus:ring-error/30"
                : "border-outline focus:border-primary focus:ring-2 focus:ring-primary/30",
              "focus:outline-none",
              className,
            ].join(" ")}
            {...props}
          />
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
