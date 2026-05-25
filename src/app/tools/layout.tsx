import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools - Health Made Clear",
  description: "Practical tools to prepare for visits, understand care options, and ask better questions.",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
