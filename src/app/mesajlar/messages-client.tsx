"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Container } from "@/components/ui/container";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

type Conversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantUsername: string;
  avatar: string;
  avatarUrl: string | null;
  listing: ListingRow | null;
  lastMessage: MessageRow | null;
  messages: MessageRow[];
};

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
      .join("") || "UP"
  );
}

function ProfileAvatar({ initials, name, avatarUrl, className }: { initials: string; name: string; avatarUrl: string | null; className: string }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (avatarUrl && !hasImageError) {
    return (
      <span className={`${className} overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" onError={() => setHasImageError(true)} />
      </span>
    );
  }

  return <span className={className}>{initials}</span>;
}

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function mergeMessages(currentMessages: MessageRow[], incomingMessage: MessageRow) {
  const existingIndex = currentMessages.findIndex((message) => message.id === incomingMessage.id);
  const nextMessages =
    existingIndex >= 0
      ? currentMessages.map((message) => (message.id === incomingMessage.id ? incomingMessage : message))
      : [...currentMessages, incomingMessage];

  return nextMessages.sort((first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime());
}

function buildConversations(
  messages: MessageRow[],
  userId: string,
  profileMap: Map<string, ProfileRow>,
  listingMap: Map<string, ListingRow>
) {
  const groupedMessages = new Map<string, MessageRow[]>();

  for (const message of messages) {
    const participantId = message.sender_id === userId ? message.receiver_id : message.sender_id;

    if (!participantId) {
      continue;
    }

    const currentGroup = groupedMessages.get(participantId) ?? [];
    currentGroup.push(message);
    groupedMessages.set(participantId, currentGroup);
  }

  return Array.from(groupedMessages.entries())
    .map(([participantId, conversationMessages]) => {
      const sortedMessages = [...conversationMessages].sort(
        (first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
      );
      const lastMessage = sortedMessages[sortedMessages.length - 1];
      const latestListingId = [...sortedMessages].reverse().find((message) => message.listing_id)?.listing_id ?? null;
      const profile = profileMap.get(participantId);
      const participantUsername = profile?.username ?? "kullanici";
      const participantName = profile?.display_name || participantUsername;

      return {
        id: participantId,
        participantId,
        participantName,
        participantUsername,
        avatar: getInitials(participantName),
        avatarUrl: profile?.avatar_url ?? null,
        listing: latestListingId ? listingMap.get(latestListingId) ?? null : null,
        lastMessage,
        messages: sortedMessages
      };
    })
    .filter((conversation): conversation is Conversation & { lastMessage: MessageRow } => Boolean(conversation.lastMessage))
    .sort(
      (first, second) =>
        new Date(second.lastMessage.created_at).getTime() - new Date(first.lastMessage.created_at).getTime()
    );
}

export function MessagesClient() {
  const searchParams = useSearchParams();
  const receiverId = searchParams.get("to")?.trim() ?? "";
  const queryListingId = searchParams.get("listing")?.trim() ?? "";
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [profileMap, setProfileMap] = useState(new Map<string, ProfileRow>());
  const [listingMap, setListingMap] = useState(new Map<string, ListingRow>());
  const [selectedConversationId, setSelectedConversationId] = useState<string>("");
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const conversations = useMemo(() => {
    if (!user) {
      return [];
    }

    return buildConversations(messages, user.id, profileMap, listingMap);
  }, [listingMap, messages, profileMap, user]);

  const pendingConversation = useMemo<Conversation | null>(() => {
    if (!receiverId) {
      return null;
    }

    const existingConversation = conversations.find((conversation) => conversation.participantId === receiverId);

    if (existingConversation) {
      return queryListingId
        ? {
            ...existingConversation,
            listing: listingMap.get(queryListingId) ?? existingConversation.listing
          }
        : existingConversation;
    }

    const profile = profileMap.get(receiverId);
    const participantUsername = profile?.username ?? "kullanici";
    const participantName = profile?.display_name || participantUsername;

    return {
      id: receiverId,
      participantId: receiverId,
      participantName,
      participantUsername,
      avatar: getInitials(participantName),
      avatarUrl: profile?.avatar_url ?? null,
      listing: queryListingId ? listingMap.get(queryListingId) ?? null : null,
      lastMessage: null,
      messages: []
    };
  }, [conversations, listingMap, profileMap, queryListingId, receiverId]);

  const activeConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ??
    pendingConversation ??
    conversations[0];

  useEffect(() => {
    if (receiverId && selectedConversationId !== receiverId) {
      setSelectedConversationId(receiverId);
      return;
    }

    if (!activeConversation && selectedConversationId) {
      setSelectedConversationId("");
      return;
    }

    if (!selectedConversationId && activeConversation) {
      setSelectedConversationId(activeConversation.id);
    }
  }, [activeConversation, receiverId, selectedConversationId]);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function loadMessages() {
      setIsLoading(true);
      setStatusMessage("");

      const {
        data: { user: currentUser },
        error: userError
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (userError || !currentUser) {
        setUser(null);
        setMessages([]);
        setProfileMap(new Map());
        setListingMap(new Map());
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (error) {
        setStatusMessage("Mesajlar yüklenemedi. Lütfen tekrar deneyin.");
        setMessages([]);
      } else {
        setMessages(data ?? []);
      }

      setIsLoading(false);
    }

    void loadMessages();

    const {
      data: { subscription: authSubscription }
    } = supabase.auth.onAuthStateChange(() => {
      void loadMessages();
    });

    return () => {
      isMounted = false;
      authSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    const supabase = getSupabaseClient();
    const participantIds = Array.from(
      new Set([
        ...messages.map((message) => (message.sender_id === user.id ? message.receiver_id : message.sender_id)),
        ...(receiverId ? [receiverId] : [])
      ])
    );
    const listingIds = Array.from(
      new Set([
        ...messages.map((message) => message.listing_id).filter((listingId): listingId is string => Boolean(listingId)),
        ...(queryListingId ? [queryListingId] : [])
      ])
    );

    async function loadRelatedData() {
      const [profilesResult, listingsResult] = await Promise.all([
        participantIds.length > 0 ? supabase.from("profiles").select("*").in("id", participantIds) : Promise.resolve({ data: [] }),
        listingIds.length > 0 ? supabase.from("listings").select("*").in("id", listingIds) : Promise.resolve({ data: [] })
      ]);

      if (!isMounted) {
        return;
      }

      setProfileMap(new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile])));
      setListingMap(new Map((listingsResult.data ?? []).map((listing) => [listing.id, listing])));
    }

    void loadRelatedData();

    return () => {
      isMounted = false;
    };
  }, [messages, queryListingId, receiverId, user]);

  useEffect(() => {
    if (!user || !receiverId) {
      return;
    }

    const queryListing = queryListingId ? listingMap.get(queryListingId) : null;

    if (receiverId === user.id || queryListing?.user_id === user.id) {
      setStatusMessage("Kendi ilanınıza mesaj gönderemezsiniz.");
    }
  }, [listingMap, queryListingId, receiverId, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const supabase = getSupabaseClient();
    const channel = supabase.channel(`messages:${user.id}`);

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages"
      },
      (payload) => {
        const incomingMessage = payload.new as MessageRow;

        if (incomingMessage.sender_id !== user.id && incomingMessage.receiver_id !== user.id) {
          return;
        }

        setMessages((currentMessages) => mergeMessages(currentMessages, incomingMessage));
      }
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !activeConversation) {
      return;
    }

    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!activeConversation.participantId) {
      console.error("Mesaj gönderilemedi: Alıcı bilgisi bulunamadı.", activeConversation);
      setStatusMessage("Alıcı bilgisi bulunamadı.");
      return;
    }

    if (activeConversation.participantId === user.id) {
      setStatusMessage("Kendi ilanınıza mesaj gönderemezsiniz.");
      return;
    }

    setIsSending(true);
    setStatusMessage("");

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: activeConversation.participantId,
        listing_id: activeConversation.listing?.id ?? null,
        content: trimmedMessage
      })
      .select("*")
      .single();

    if (error) {
      console.error("Mesaj gönderilemedi:", error);
      setStatusMessage("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
    } else if (data) {
      const receiverId = activeConversation.participantId;
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("display_name,username")
        .eq("id", user.id)
        .maybeSingle();
      const senderName = senderProfile?.display_name || senderProfile?.username || user.email?.split("@")[0] || "Bir kullanıcı";
      const listingTitle = activeConversation.listing?.title;
      const notificationBody = listingTitle
        ? `${senderName} size "${listingTitle}" ilanı hakkında yeni bir mesaj gönderdi.`
        : `${senderName} size yeni bir mesaj gönderdi.`;
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: receiverId,
        type: "new_message",
        title: "Yeni bir mesaj aldınız.",
        body: notificationBody,
        link_url: "/mesajlar",
        is_read: false
      });

      if (notificationError) {
        console.error("Mesaj bildirimi oluşturulamadı:", notificationError);
      }

      setDraftMessage("");
      setMessages((currentMessages) => mergeMessages(currentMessages, data));
    }

    setIsSending(false);
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-12 md:py-16">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            Mesajlar
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            Alıcı ve satıcı görüşmelerini tek ekranda takip et.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            Dijital ürünler hakkında demo, lisans ve teslim kapsamı konuşmaları için modern marketplace mesaj arayüzü.
          </p>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          {!isLoading && !user ? (
            <div className="market-card mb-6 bg-red-50 p-4 ring-1 ring-red-100">
              <p className="text-sm font-bold leading-6 text-brand-red">
                Mesajları görüntülemek ve yeni mesaj göndermek için giriş yapmalısınız.
              </p>
            </div>
          ) : null}

          {statusMessage ? (
            <div className="market-card mb-6 bg-red-50 p-4 ring-1 ring-red-100">
              <p className="text-sm font-bold leading-6 text-brand-red">{statusMessage}</p>
            </div>
          ) : null}

          <div className="market-card grid min-h-[calc(100vh-9rem)] min-w-0 overflow-hidden lg:min-h-[720px] lg:grid-cols-[360px_1fr]">
            <aside className="border-b border-neutral-200 bg-brand-white lg:border-b-0 lg:border-r">
              <div className="border-b border-neutral-100 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="tag-text text-brand-red">Gelen Kutusu</p>
                    <h2 className="mt-1 text-2xl font-black text-brand-black">Konuşmalar</h2>
                  </div>
                  <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-black text-brand-white">
                    {conversations.length}
                  </span>
                </div>
                <div className="mt-4 flex min-h-11 items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-neutral-500" fill="none" aria-hidden="true">
                    <path
                      d="m20 20-4.2-4.2M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                  <input
                    className="min-w-0 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-500"
                    placeholder="Konuşma ara"
                  />
                </div>
              </div>

              <div className="max-h-[360px] overflow-y-auto lg:max-h-[640px]">
                {isLoading ? (
                  <p className="p-5 text-sm font-bold text-neutral-500">Mesajlar yükleniyor...</p>
                ) : conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`flex w-full items-start gap-3 border-b border-neutral-100 p-4 text-left transition hover:bg-neutral-50 ${
                        activeConversation?.id === conversation.id ? "bg-red-50/60" : "bg-brand-white"
                      }`}
                    >
                      <ProfileAvatar
                        initials={conversation.avatar}
                        name={conversation.participantName}
                        avatarUrl={conversation.avatarUrl}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-brand-white"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center justify-between gap-3">
                          <span className="truncate text-sm font-black text-brand-black">{conversation.participantName}</span>
                          <span className="shrink-0 text-xs font-bold text-neutral-500">
                            {formatMessageTime(conversation.lastMessage.created_at)}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-xs font-bold text-brand-red">
                          {conversation.listing?.title ?? "Ürün konuşması"}
                        </span>
                        <span className="mt-1 line-clamp-2 text-sm leading-5 text-neutral-600">
                          {conversation.lastMessage.content}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="p-5 text-sm font-bold text-neutral-500">Henüz konuşmanız yok.</p>
                )}
              </div>
            </aside>

            <main className="flex min-w-0 flex-col bg-neutral-50">
              {activeConversation ? (
                <>
                  <header className="border-b border-neutral-200 bg-brand-white p-5">
                    <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <ProfileAvatar
                          initials={activeConversation.avatar}
                          name={activeConversation.participantName}
                          avatarUrl={activeConversation.avatarUrl}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-brand-white"
                        />
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-black text-brand-black">{activeConversation.participantName}</h2>
                          <Link
                            href={`/profil/${activeConversation.participantUsername}`}
                            className="text-sm font-bold text-neutral-500 transition hover:text-brand-red"
                          >
                            @{activeConversation.participantUsername}
                          </Link>
                        </div>
                      </div>
                      {activeConversation.listing ? (
                        <Link
                          href={`/urun/${activeConversation.listing.slug}`}
                          className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-black text-neutral-700 ring-1 ring-neutral-200 transition hover:bg-red-50 hover:text-brand-red hover:ring-red-100"
                        >
                          Ürünü Gör
                        </Link>
                      ) : null}
                    </div>
                  </header>

                  <div className="border-b border-neutral-200 bg-brand-white p-5">
                    {activeConversation.listing ? (
                      <Link
                        href={`/urun/${activeConversation.listing.slug}`}
                        className="market-card grid min-w-0 gap-4 overflow-hidden p-4 sm:grid-cols-[96px_1fr]"
                      >
                        <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-red-600 via-neutral-950 to-neutral-800" />
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase text-brand-red">Ürün konuşması</p>
                          <h3 className="mt-1 break-words text-lg font-black text-brand-black">{activeConversation.listing.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-neutral-600">
                            Demo, lisans ve teslim kapsamı hakkında görüşme.
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="market-card p-4">
                        <p className="text-sm font-bold text-neutral-600">Bu konuşmaya bağlı ürün bilgisi bulunamadı.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    {activeConversation.messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id;

                      return (
                        <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[88%] break-words rounded-2xl px-4 py-3 shadow-sm md:max-w-[64%] ${
                              isOwnMessage
                                ? "rounded-br-md bg-neutral-950 text-brand-white"
                                : "rounded-bl-md bg-brand-white text-neutral-800 ring-1 ring-neutral-200"
                            }`}
                          >
                            <p className={`text-sm font-semibold leading-6 ${isOwnMessage ? "text-brand-white" : "text-neutral-800"}`}>
                              {message.content}
                            </p>
                            <p className={`mt-2 text-xs font-bold ${isOwnMessage ? "text-white/65" : "text-neutral-500"}`}>
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <footer className="border-t border-neutral-200 bg-brand-white p-4">
                    <form onSubmit={handleSubmit} className="flex min-w-0 items-end gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-2 sm:gap-3">
                      <textarea
                        rows={1}
                        value={draftMessage}
                        onChange={(event) => setDraftMessage(event.target.value)}
                        className="min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-3 text-sm font-semibold leading-5 outline-none placeholder:text-neutral-500"
                        placeholder="Mesaj yazın..."
                      />
                      <button type="submit" disabled={isSending} className="btn-primary min-h-11 shrink-0 px-4 disabled:cursor-not-allowed disabled:opacity-70 sm:px-5">
                        {isSending ? "..." : "Gönder"}
                      </button>
                    </form>
                  </footer>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-6">
                  <p className="text-center text-sm font-bold text-neutral-500">
                    {user ? "Bir konuşma seçin veya yeni mesaj bekleyin." : "Mesajlarınızı görmek için giriş yapın."}
                  </p>
                </div>
              )}
            </main>
          </div>
        </Container>
      </section>
    </>
  );
}
