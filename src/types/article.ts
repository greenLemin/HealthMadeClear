import type { ArticleId } from "@/types/content";

export interface Article {
  id: ArticleId;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  lastReviewed?: string;
  reviewedBy?: string;
  sources?: string[];
  content: {
    sections: {
      title: string;
      content: string;
      callouts?: {
        type: "info" | "success" | "warning";
        content: string;
      }[];
    }[];
  };
}
