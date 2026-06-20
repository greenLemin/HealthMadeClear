import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationInput = {
  type: string;
  title: string;
  body: string;
};

export async function createNotifications(
  supabase: SupabaseClient,
  userId: string,
  inputs: NotificationInput[]
): Promise<void> {
  if (inputs.length === 0) return;
  const records = inputs.map((input) => ({
    user_id: userId,
    type: input.type,
    title: input.title,
    body: input.body,
    read: false,
  }));
  await supabase.from("notifications").insert(records);
}

export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  input: NotificationInput
): Promise<void> {
  await supabase.from("notifications").insert({
    user_id: userId,
    type: input.type,
    title: input.title,
    body: input.body,
    read: false,
  });
}

export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 10
): Promise<Notification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as Notification[];
}

export async function markAsRead(
  supabase: SupabaseClient,
  userId: string,
  notificationId: string
): Promise<void> {
  await supabase.from("notifications").update({ read: true }).eq("id", notificationId).eq("user_id", userId);
}

export async function markAllAsRead(supabase: SupabaseClient, userId: string): Promise<void> {
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId).is("read", false);
}

export async function getUnreadCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  return count ?? 0;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}
