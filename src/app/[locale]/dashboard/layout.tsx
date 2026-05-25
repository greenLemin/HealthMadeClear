import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Health Made Clear",
  description: "Track your learning progress and pick up where you left off.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
