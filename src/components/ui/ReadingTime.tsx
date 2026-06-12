import { Clock } from "lucide-react";

interface ReadingTimeProps {
  wordCount: number;
  className?: string;
}

const WORDS_PER_MINUTE = 200;

export default function ReadingTime({ wordCount, className = "" }: ReadingTimeProps) {
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

  return (
    <span
      className={["inline-flex items-center gap-1.5 text-label-md text-on-surface-variant", className].join(
        " "
      )}
    >
      <Clock size={14} aria-hidden="true" />
      <span>
        {minutes} {minutes === 1 ? "min" : "min"} read
      </span>
    </span>
  );
}
