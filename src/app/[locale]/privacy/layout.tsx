import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy - Health Made Clear",
  description: "How we handle your information at Health Made Clear.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
