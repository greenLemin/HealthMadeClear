import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CookieStore, MockCookieStore, SelectOptions } from "./mock/types";
import { parseFirstJsonObject } from "./mock/utils";
import { cloneDefaultDb } from "./mock/defaults";
import { saveMockDb } from "./mock/store";
import { createQueryBuilder } from "./mock/queryBuilder";
import { createMockAuth, emitAuthStateChange } from "./mock/auth";

export type { CookieStore, MockCookieStore, SelectOptions };
export { parseFirstJsonObject };

export function getMockSupabaseClient(cookieStore?: CookieStore): SupabaseClient<Database, "public", any> {
  return {
    supabaseUrl: "https://placeholder.supabase.co",
    auth: createMockAuth(cookieStore),
    from(table: string) {
      return createQueryBuilder(table, cookieStore);
    },
    rpc(fn: string) {
      if (fn === "delete_user") {
        const nextDb = cloneDefaultDb();
        saveMockDb(nextDb, cookieStore);
        emitAuthStateChange("SIGNED_OUT", null);
        return Promise.resolve({ data: null, error: null });
      }

      return Promise.resolve({ data: null, error: null });
    },
  } as unknown as SupabaseClient<Database, "public", any>;
}
