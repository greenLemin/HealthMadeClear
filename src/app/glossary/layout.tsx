import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Glossary - Health Made Clear",
  description: "Clear, everyday definitions for medical terms.",
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
