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
      className={className}
      draggable={false}
      width={48}
      height={48}
      unoptimized // Next.js images need unoptimized for static export/Netlify sometimes, or we just provide width/height
    />
  );
}
