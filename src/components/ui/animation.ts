export const revealEase = [0.22, 1, 0.36, 1] as const;

export const modalVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 14, scale: 0.985 },
};
