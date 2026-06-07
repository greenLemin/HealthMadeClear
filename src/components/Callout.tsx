import type { ReactNode } from "react";

type CalloutType = "info" | "success" | "warning";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Callout({ type = "info", title, children, className = "" }: CalloutProps) {
  const typeClasses = {
    info: "border-l-4 border-primary bg-primary-fixed/30",
    success: "border-l-4 border-secondary bg-secondary-container/60",
    warning: "border-l-4 border-error bg-error-container",
  };

  return (
    <div className={`rounded-2xl p-6 ${typeClasses[type]} ${className}`}>
      {title ? <h2 className="mb-2 text-label-lg text-primary">{title}</h2> : null}
      <div className="text-body-md text-on-surface-variant">{children}</div>
    </div>
  );
}
