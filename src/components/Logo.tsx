interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-12 w-12" }: LogoProps) {
  // SVG favicon is not optimizable via next/image — keep <img> with explicit dimensions to avoid CLS.
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG favicon not optimizable
    <img
      src="/favicon.svg"
      alt="Health Made Clear logo"
      className={className}
      draggable={false}
      width={48}
      height={48}
    />
  );
}
