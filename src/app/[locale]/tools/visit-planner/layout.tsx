import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Visit Planner - Health Made Clear",
  description: "Prepare for your upcoming appointment with a custom list of questions and notes.",
};

export default function VisitPlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
