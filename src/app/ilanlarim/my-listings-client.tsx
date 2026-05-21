"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

const statusLabels: Record<ListingRow["status"], string> = {
  pending: "Onay Bekliyor",
  approved: "Yayında",
  rejected: "Reddedildi"
};

const statusClasses: Record<ListingRow["status"], string> = {
  pending: "bg-yellow-50 text-yellow-800 ring-yellow-100",
  approved: "bg-green-50 text-green-700 ring-green-100",
  rejected: "bg-red-50 text-brand-red ring-red-100"
};

function formatPrice(listing: ListingRow) {
  if (listing.is_free || listing.price === null) {
    return "Ücretsiz";
  }

  return `${listing.price.toLocaleString("tr-TR")} TL`;
}

function ListingThumb({ listing }: { listing: ListingRow }) {
  if (listing.thumbnail_url) {
    return (
      <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={listing.thumbnail_url} alt={listing.title} className="h-full w-full object-cover" />
      </div>
    );
  }

  return <div className="aspect-[16/10] bg-gradient-to-br from-red-600 via-neutral-950 to-neutral-800" />;
}

export function MyListingsClient() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function loadListings() {
      setIsLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (userError || !user) {
        router.push("/giris");
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("İlanlar yüklenemedi:", error);
        setErrorMessage("İlanlarınız yüklenemedi. Lütfen tekrar deneyin.");
        setListings([]);
      } else {
        setListings(data ?? []);
      }

      setIsLoading(false);
    }

    void loadListings();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleDelete(listing: ListingRow) {
    const confirmed = window.confirm(`"${listing.title}" ilanını silmek istediğinizden emin misiniz?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(listing.id);
    setErrorMessage("");
    setStatusMessage("");

    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/giris");
      return;
    }

    const { error } = await supabase.from("listings").delete().eq("id", listing.id).eq("user_id", user.id);

    if (error) {
      console.error("İlan silinemedi:", error);
      setErrorMessage("İlan silinemedi. RLS policy için kullanıcıların kendi listings kayıtlarını silebilmesi gerekir.");
    } else {
      setListings((currentListings) => currentListings.filter((currentListing) => currentListing.id !== listing.id));
      setStatusMessage("İlan silindi.");
    }

    setDeletingId(null);
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-12 md:py-16">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            İlanlarım
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            İlanlarını yönet.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            Yayındaki, onay bekleyen ve reddedilen ilanlarını tek ekranda takip et.
          </p>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          {statusMessage ? <div className="market-card mb-6 bg-green-50 p-4 text-sm font-bold text-green-700 ring-1 ring-green-100">{statusMessage}</div> : null}
          {errorMessage ? <div className="market-card mb-6 bg-red-50 p-4 text-sm font-bold text-brand-red ring-1 ring-red-100">{errorMessage}</div> : null}

          {isLoading ? (
            <div className="market-card p-10 text-center text-sm font-bold text-neutral-500">İlanlar yükleniyor...</div>
          ) : listings.length > 0 ? (
            <div className="grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <article key={listing.id} className="market-card min-w-0 overflow-hidden">
                  <ListingThumb listing={listing} />
                  <div className="min-w-0 p-5">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <p className="min-w-0 break-words text-xs font-black uppercase text-brand-red">{listing.category_slug ?? "Marketplace"}</p>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ring-1 ${statusClasses[listing.status]}`}>
                        {statusLabels[listing.status]}
                      </span>
                    </div>
                    <h2 className="mt-2 break-words text-xl font-black leading-7 text-brand-black">{listing.title}</h2>
                    <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-neutral-600">{listing.short_description}</p>
                    <div className="mt-4 flex min-w-0 items-center justify-between gap-3 text-sm font-bold text-neutral-600">
                      <span className="min-w-0 break-words">{formatPrice(listing)}</span>
                      <span className="shrink-0">{listing.created_at?.slice(0, 10) ?? "Tarih yok"}</span>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-4">
                      <Link href={`/urun/${listing.slug}`} className="btn-outline min-h-10 min-w-0 px-2 text-center text-xs sm:px-3 sm:text-sm">
                        Görüntüle
                      </Link>
                      <Link href={`/ilanlarim/${listing.id}/duzenle`} className="btn-secondary min-h-10 min-w-0 px-2 text-center text-xs sm:px-3 sm:text-sm">
                        Düzenle
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDelete(listing)}
                        disabled={deletingId === listing.id}
                        className="btn-primary min-h-10 min-w-0 px-2 text-xs disabled:cursor-not-allowed disabled:opacity-70 sm:px-3 sm:text-sm"
                      >
                        {deletingId === listing.id ? "..." : "Sil"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="market-card p-10 text-center">
              <h2 className="text-2xl font-black text-brand-black">Henüz ilanınız yok.</h2>
              <p className="mt-3 text-sm font-semibold text-neutral-600">İlk ilanınızı oluşturarak marketplace vitrinine çıkın.</p>
              <Link href="/ilan-ver" className="btn-primary mt-5">
                İlan Ver
              </Link>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
