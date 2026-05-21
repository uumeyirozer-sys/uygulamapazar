"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

const typeLabels: Record<NotificationRow["type"], string> = {
  listing_approved: "İlan onaylandı",
  listing_rejected: "İlan reddedildi",
  new_message: "Yeni mesaj",
  new_favorite: "Favoriye eklendi"
};

function formatNotificationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function mergeNotification(currentNotifications: NotificationRow[], incomingNotification: NotificationRow) {
  const exists = currentNotifications.some((notification) => notification.id === incomingNotification.id);
  const nextNotifications = exists
    ? currentNotifications.map((notification) => (notification.id === incomingNotification.id ? incomingNotification : notification))
    : [incomingNotification, ...currentNotifications];

  return nextNotifications.sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime());
}

export function NotificationsClient() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();
    let currentUserId = "";

    async function loadNotifications() {
      setIsLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      currentUserId = user?.id ?? "";

      if (userError || !user) {
        setNotifications([]);
        setIsLoading(false);
        router.push("/giris");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Bildirimler yuklenemedi:", error);
        setErrorMessage("Bildirimler yüklenemedi. Lütfen tekrar deneyin.");
        setNotifications([]);
      } else {
        setNotifications(data ?? []);
      }

      setIsLoading(false);
    }

    void loadNotifications();

    const {
      data: { subscription: authSubscription }
    } = supabase.auth.onAuthStateChange(() => {
      void loadNotifications();
    });

    const channel = supabase.channel("notifications-page");

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
          setNotifications((currentNotifications) => mergeNotification(currentNotifications, notification));
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
          setNotifications((currentNotifications) => mergeNotification(currentNotifications, notification));
        }
      }
    );

    channel.subscribe();

    return () => {
      isMounted = false;
      authSubscription.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [router]);

  async function handleNotificationClick(notification: NotificationRow, href: string) {
    if (notification.is_read) {
      router.push(href);
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notification.id)
      .eq("user_id", notification.user_id);

    if (error) {
      console.error("Bildirim okundu isaretlenemedi:", error);
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((currentNotification) =>
        currentNotification.id === notification.id ? { ...currentNotification, is_read: true } : currentNotification
      )
    );
    router.push(href);
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-12 md:py-16">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            Bildirimler
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            Marketplace hareketlerini anlık takip et.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            İlan onayları, mesajlar ve favoriler için gerçek zamanlı bildirim merkezi.
          </p>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container className="grid min-w-0 gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          <aside className="market-card min-w-0 p-5">
            <p className="tag-text text-brand-red">Özet</p>
            <h2 className="mt-2 text-2xl font-black text-brand-black">{unreadCount} okunmamış bildirim</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">Bildirimler Supabase public.notifications tablosundan gelir.</p>
            <div className="mt-5 grid gap-2">
              {["Tümü", "Okunmamış", "İlanlar", "Mesajlar"].map((filter, index) => (
                <span
                  key={filter}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-black ${
                    index === 0 ? "bg-neutral-950 text-brand-white" : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {filter}
                </span>
              ))}
            </div>
          </aside>

          <main className="market-card min-w-0 overflow-hidden">
            <div className="border-b border-neutral-100 p-5">
              <p className="tag-text text-brand-red">Merkez</p>
              <h2 className="mt-2 text-2xl font-black text-brand-black">Bildirim akışı</h2>
              {errorMessage ? <p className="mt-3 text-sm font-bold text-brand-red">{errorMessage}</p> : null}
            </div>
            <div className="divide-y divide-neutral-100">
              {isLoading ? (
                <p className="p-5 text-sm font-bold text-neutral-500">Bildirimler yükleniyor...</p>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => {
                  const href = notification.link_url || "/bildirimler";

                  return (
                    <Link
                      key={notification.id}
                      href={href}
                      onClick={(event) => {
                        event.preventDefault();
                        void handleNotificationClick(notification, href);
                      }}
                      className={`grid min-w-0 gap-4 p-5 transition hover:bg-neutral-50 md:grid-cols-[44px_1fr_auto] md:items-start ${
                        notification.is_read ? "bg-brand-white" : "bg-red-50/60"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black ${
                          notification.is_read ? "bg-neutral-100 text-neutral-700" : "bg-brand-red text-brand-white"
                        }`}
                      >
                        {typeLabels[notification.type].charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-700">
                            {typeLabels[notification.type]}
                          </span>
                          {!notification.is_read ? (
                            <span className="rounded-full bg-brand-red px-2.5 py-1 text-xs font-black text-brand-white">Yeni</span>
                          ) : null}
                        </span>
                        <span className="mt-3 block break-words text-lg font-black text-brand-black">{notification.title}</span>
                        <span className="mt-1 block break-words text-sm leading-6 text-neutral-600">{notification.body}</span>
                      </span>
                      <span className="text-sm font-bold text-neutral-500 md:text-right">{formatNotificationDate(notification.created_at)}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <h3 className="text-xl font-black text-brand-black">Henüz bildiriminiz yok.</h3>
                  <p className="mt-2 text-sm font-bold text-neutral-500">Yeni mesaj, favori ve ilan durumları burada görünür.</p>
                </div>
              )}
            </div>
          </main>
        </Container>
      </section>
    </>
  );
}
