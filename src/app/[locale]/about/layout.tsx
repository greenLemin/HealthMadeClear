import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Health Made Clear",
  description: "Our mission is to make health information clear and accessible for everyone.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
