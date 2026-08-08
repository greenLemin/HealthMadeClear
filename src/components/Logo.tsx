import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-12 w-12" }: LogoProps) {
  return (
    <Image
      src="/logo.jpeg"
      width={48}
      height={48}
      alt="Health Made Clear logo"
      className={className}
      draggable={false}
    />
  );
}
