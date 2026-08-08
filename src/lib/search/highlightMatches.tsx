import React from "react";

export function highlightMatches(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-primary-container px-0.5 text-on-primary-container">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
