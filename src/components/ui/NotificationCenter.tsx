"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Bell, BellDot, CheckCheck, Trophy, Flame, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from "@/lib/notifications";
import type { Notification as DbNotification } from "@/lib/notifications";
import { useTranslations } from "next-intl";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";

function formatNotifTime(dateStr: string, tCommon: ReturnType<typeof useTranslations<"common">>): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return tCommon("relativeJustNow");
  if (diffMins < 60) return tCommon("relativeMinutes", { count: diffMins });
  if (diffHours < 24) return tCommon("relativeHours", { count: diffHours });
  if (diffDays === 1) return tCommon("relativeYesterday");
  if (diffDays < 7) return tCommon("relativeDays", { count: diffDays });
  return date.toLocaleDateString();
}

function getNotifIcon(type: string) {
  switch (type) {
    case "achievement":
      return <Trophy size={16} className="text-secondary" />;
    case "streak":
      return <Flame size={16} className="text-tertiary" />;
    case "close-to-completion":
      return <Target size={16} className="text-primary" />;
    default:
      return <Bell size={16} className="text-primary" />;
  }
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const supabase = useMemo(() => createClient(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(panelRef, isOpen);
  useDismissibleOverlay({
    isOpen,
    onClose: () => setIsOpen(false),
    containerRef: panelRef,
    triggerRef: buttonRef,
    returnFocusRef: buttonRef,
  });

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [notifs, count] = await Promise.all([
      getNotifications(supabase, user.id, 10),
      getUnreadCount(supabase, user.id),
    ]);
    setNotifications(notifs);
    setUnreadCount(count);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Removed manual click outside listener in favor of useDismissibleOverlay hook

  async function handleMarkAllRead() {
    if (!user) return;
    await markAllAsRead(supabase, user.id);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function handleClick(notif: DbNotification) {
    if (!user) return;
    if (!notif.read) {
      await markAsRead(supabase, user.id, notif.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    }
  }

  if (!user) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        aria-label={t("ariaLabel", { count: unreadCount })}
      >
        {unreadCount > 0 ? <BellDot size={20} /> : <Bell size={20} />}
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-label-sm font-bold text-on-error">
            <span className="sr-only" aria-live="polite">
              {unreadCount} {t("title")}
            </span>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-outline-variant bg-surface shadow-elevation-3 motion-safe:animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
            <span className="text-label-md font-semibold text-on-surface">{t("title")}</span>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-label-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                <CheckCheck size={14} />
                {t("markAllRead")}
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-label-md text-on-surface-variant">
                {tCommon("loading")}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-label-md text-on-surface-variant">
                {t("empty")} 🎉
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => handleClick(notif)}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container ${
                      !notif.read ? "bg-primary-fixed/10" : ""
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-label-sm ${
                          notif.read ? "text-on-surface" : "font-semibold text-on-surface"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">{notif.body}</p>
                      <p className="mt-0.5 text-label-sm text-on-surface-variant">
                        {formatNotifTime(notif.created_at, tCommon)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
