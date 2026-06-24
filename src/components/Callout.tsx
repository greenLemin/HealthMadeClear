import type { ReactNode, ElementType } from "react";

type CalloutType = "info" | "success" | "warning";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
  className?: string;
  headingLevel?: "h2" | "h3" | "h4";
  typeLabel?: string;
}

const defaultTypeLabels: Record<CalloutType, string> = {
  info: "Note",
  success: "Tip",
  warning: "Warning",
};

export default function Callout({
  type = "info",
  title,
  children,
  className = "",
  headingLevel = "h2",
  typeLabel,
}: CalloutProps) {
  const typeClasses = {
    info: "border-l-4 border-primary bg-primary-fixed/30",
    success: "border-l-4 border-secondary bg-secondary-container/60",
    warning: "border-l-4 border-error bg-error-container",
  };

  const Heading = headingLevel as ElementType;
  const label = typeLabel ?? defaultTypeLabels[type];

  return (
    <div
      role="note"
      aria-label={title ? undefined : label}
      className={`rounded-2xl p-6 ${typeClasses[type]} ${className}`}
    >
      {title ? (
        <Heading className="mb-2 text-label-lg text-primary">
          <span className="sr-only">{label}: </span>
          {title}
        </Heading>
      ) : null}
      <div className="text-body-md text-on-surface-variant">{children}</div>
    </div>
  );
}

export type { CalloutType, CalloutProps };
