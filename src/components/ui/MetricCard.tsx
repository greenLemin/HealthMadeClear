import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string | null;
  tone?: string;
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "surface-card",
}: MetricCardProps) {
  return (
    <div className={`${tone} px-5 py-5 md:px-6 md:py-6`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-elevation-1">
        <Icon size={22} aria-hidden="true" />
      </div>
      <p className="mt-4 text-label-md text-on-surface-variant">{label}</p>
      <p className="mt-2 font-display text-headline-md text-primary">{value}</p>
      {detail ? <p className="mt-2 text-label-md text-on-surface-variant">{detail}</p> : null}
    </div>
  );
}
