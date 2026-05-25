import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Care Guide - Health Made Clear",
  description: "Choose the right place for medical care based on your symptoms.",
};

export default function CareGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
