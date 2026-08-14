"use client";

import { useMemo, useState } from "react";

export function useFilteredCollection<T>(items: T[], filterFn: (item: T, query: string) => boolean) {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return items.filter((item) => filterFn(item, lowerQuery));
  }, [items, query, filterFn]);

  return { query, setQuery, filteredItems };
}
