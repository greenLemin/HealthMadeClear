import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn - Health Made Clear",
  description: "Clear, reliable guides to help you navigate your health journey.",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
