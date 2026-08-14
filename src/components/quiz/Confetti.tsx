"use client";

import { useState } from "react";

export default function Confetti() {
  const particleCount = 30;
  const [particles] = useState(() =>
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${0.5 + Math.random() * 1}s`,
      color: [
        "var(--color-primary)",
        "var(--color-secondary)",
        "var(--color-tertiary)",
        "var(--color-primary-container)",
        "var(--color-secondary-container)",
      ][Math.floor(Math.random() * 5)],
      size: 4 + Math.random() * 8,
    }))
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-fall rounded-full"
          style={{
            left: p.left,
            top: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            animationName: "confetti-fall",
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall {
          animation: confetti-fall 1s ease-out forwards;
        }
        @media (prefers-reduced-motion) {
          .animate-fall { animation: none !important; display: none; }
        }
      `}</style>
    </div>
  );
}
