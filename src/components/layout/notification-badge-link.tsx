"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

type NotificationBadgeLinkProps = {
  compact?: boolean;
};

function createRealtimeChannelId() {
  const randomId =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return randomId;
}

export function NotificationBadgeLink({ compact = false }: NotificationBadgeLinkProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();
    let currentUserId = "";

    async function loadUnreadCount() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      currentUserId = user?.id ?? "";

      if (!currentUserId) {
        setUnreadCount(0);
        return;
      }

      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", currentUserId)
        .eq("is_read", false);

      if (isMounted) {
        setUnreadCount(count ?? 0);
      }
    }

    void loadUnreadCount();

    const {
      data: { subscription: authSubscription }
    } = supabase.auth.onAuthStateChange(() => {
      void loadUnreadCount();
    });

    const channel = supabase.channel(`header-notifications:${compact ? "compact" : "full"}:${createRealtimeChannelId()}`);

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications"
      },
      (payload) => {
        const notification = payload.new as NotificationRow;

        if (notification.user_id === currentUserId) {
          void loadUnreadCount();
        }
      }
    );

    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications"
      },
      (payload) => {
        const notification = payload.new as NotificationRow;

        if (notification.user_id === currentUserId) {
          void loadUnreadCount();
        }
      }
    );

    channel.subscribe();

    return () => {
      isMounted = false;
      authSubscription.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [compact]);

  return (
    <Link
      href="/bildirimler"
      className={
        compact
          ? "btn-outline relative min-h-10 px-3"
          : "relative rounded-lg px-3 py-2 text-sm font-bold text-neutral-600 transition duration-200 ease-premium hover:bg-neutral-100 hover:text-brand-black"
      }
      aria-label="Bildirimler"
    >
      {compact ? "Bild." : "Bildirimler"}
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1.5 text-[11px] font-black leading-none text-brand-white ring-2 ring-brand-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
