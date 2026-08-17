export type SearchEntryType = "lesson" | "article" | "glossary" | "path" | "tool";

export interface SearchEntry {
  id: string;
  type: SearchEntryType;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  content: string;
  url: string;
}
