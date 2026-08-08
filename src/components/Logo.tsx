import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-12 w-12" }: LogoProps) {
  return (
    <Image
      src="/logo.jpeg"
      alt="Health Made Clear logo"
      width={48}
      height={48}
      className={className}
      draggable={false}
    />
  );
}
