"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  once?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export const revealEase = [0.22, 1, 0.36, 1] as const;

export const modalVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 14, scale: 0.985 },
};

export default function Reveal({
  children,
  delay = 0,
  distance = 26,
  once = true,
  className,
  id,
  style,
  onClick,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className} id={id} style={style} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      id={id}
      style={style}
      onClick={onClick}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.75, delay, ease: revealEase }}
    >
      {children}
    </motion.div>
  );
}
