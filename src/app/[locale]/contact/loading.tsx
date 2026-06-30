import StaticPageLoading from "@/components/loading/StaticPageLoading";

export default function ContactLoading() {
  return (
    <StaticPageLoading
      centered
      headingWidth="min(100%, 16rem)"
      primaryCardHeight="420px"
      primaryCardClassName="max-w-2xl"
    />
  );
}
