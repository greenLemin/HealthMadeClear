import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";

interface KeyTakeawayProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function KeyTakeaway({ children, title = "Key Takeaway", className = "" }: KeyTakeawayProps) {
  return (
    <aside aria-label={title} className={["rounded-2xl bg-primary-fixed/30 p-5", className].join(" ")}>
      <div className="mb-2 flex items-center gap-2 text-label-lg text-primary">
        <Lightbulb size={20} aria-hidden="true" />
        <span>{title}</span>
      </div>
      <div className="text-body-md text-on-surface-variant">{children}</div>
    </aside>
  );
}
