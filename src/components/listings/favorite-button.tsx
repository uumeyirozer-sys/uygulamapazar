"use client";

import { MouseEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type FavoriteButtonProps = {
  listingId: string;
  className?: string;
  onFavoriteChange?: (isFavorite: boolean) => void;
};

export function FavoriteButton({ listingId, className = "", onFavoriteChange }: FavoriteButtonProps) {
  const router = useRouter();
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function loadFavoriteStatus() {
      setIsLoading(true);

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (userError || !user) {
        setFavoriteId(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Favori durumu alınamadı:", error);
        setErrorMessage("Favori durumu alınamadı.");
      } else {
        setFavoriteId(data?.id ?? null);
      }

      setIsLoading(false);
    }

    void loadFavoriteStatus();

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  async function handleToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isSaving || isLoading) {
      return;
    }

    setErrorMessage("");
    setIsSaving(true);

    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setIsSaving(false);
      router.push("/giris");
      return;
    }

    if (favoriteId) {
      const { error } = await supabase.from("favorites").delete().eq("id", favoriteId).eq("user_id", user.id);

      if (error) {
        console.error("Favori kaldırılamadı:", error);
        setErrorMessage("Favori kaldırılamadı.");
      } else {
        setFavoriteId(null);
        onFavoriteChange?.(false);
      }

      setIsSaving(false);
      return;
    }

    const { data: existingFavorite, error: selectError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (selectError) {
      console.error("Favori kontrol edilemedi:", selectError);
      setErrorMessage("Favori kontrol edilemedi.");
      setIsSaving(false);
      return;
    }

    if (existingFavorite) {
      setFavoriteId(existingFavorite.id);
      onFavoriteChange?.(true);
      setIsSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        listing_id: listingId
      })
      .select("id")
      .single();

    if (error) {
      console.error("Favori eklenemedi:", error);
      setErrorMessage("Favori eklenemedi.");
    } else {
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("user_id,title,slug")
        .eq("id", listingId)
        .maybeSingle();

      if (!listingError && listing && listing.user_id !== user.id) {
        const { error: notificationError } = await supabase.from("notifications").insert({
          user_id: listing.user_id,
          type: "new_favorite",
          title: "Bir kullanıcı ilanınızı favorilere ekledi.",
          body: `"${listing.title}" ilanınız bir kullanıcı tarafından favorilere eklendi.`,
          link_url: `/urun/${listing.slug}`
        });

        if (notificationError) {
          console.error("Favori bildirimi olusturulamadi:", notificationError);
        }
      }

      setFavoriteId(data.id);
      onFavoriteChange?.(true);
    }

    setIsSaving(false);
  }

  const isFavorite = Boolean(favoriteId);

  return (
    <div className={`absolute right-3 top-3 z-10 flex flex-col items-end gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isSaving || isLoading}
        aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
        title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
        className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
          isFavorite
            ? "border-red-100 bg-brand-red text-brand-white"
            : "border-white/70 bg-brand-white/95 text-neutral-700 hover:bg-red-50 hover:text-brand-red"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} aria-hidden="true">
          <path
            d="M12 20.2s-7-4.35-8.9-8.6C1.9 8.9 3.45 5.8 6.35 5.35c1.7-.25 3.1.55 3.95 1.7.85-1.15 2.25-1.95 3.95-1.7 2.9.45 4.45 3.55 3.25 6.25C19 15.85 12 20.2 12 20.2Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>
      {errorMessage ? (
        <span className="max-w-40 rounded-lg bg-brand-white px-2.5 py-1 text-right text-xs font-bold text-brand-red shadow-sm ring-1 ring-red-100">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
