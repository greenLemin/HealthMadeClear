import React from "react";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-12 w-12" }: LogoProps) {
  return <img src="/logo.jpeg" alt="Health Made Clear logo" className={className} draggable={false} />;
}
