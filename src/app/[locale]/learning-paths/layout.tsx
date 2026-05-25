import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Paths - Health Made Clear",
  description: "Structured, step-by-step journeys to help you build confidence and understand your care.",
};

export default function LearningPathsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
