import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visit Checklist - Health Made Clear",
  description: "A printable checklist to make sure you have everything ready for your appointment.",
};

export default function VisitChecklistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
