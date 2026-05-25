import Callout from "@/components/Callout";

export default function LessonCallout({
  type = "info",
  children,
}: {
  type?: "info" | "success" | "warning";
  children: React.ReactNode;
}) {
  return (
    <Callout type={type} className="mt-4">
      {children}
    </Callout>
  );
}
