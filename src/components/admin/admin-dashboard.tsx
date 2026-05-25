"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminActions } from "@/components/admin/admin-actions";
import { ProductVisual } from "@/components/listings/product-visual";
import { getFriendlyAuthError } from "@/lib/auth";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type Listing = Database["public"]["Tables"]["listings"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ListingStatus = Listing["status"];

const adSlots = [
  { title: "Sidebar reklam", status: "Aktif", location: "Ürün detay sağ panel", size: "300x250", note: "Desktop görünümde sabit native kart." },
  { title: "Ürün arası native reklam", status: "Aktif", location: "Kategori ürün grid", size: "Full width", note: "Liste akışını bozmadan gösterilir." },
  { title: "Kategori üstü banner", status: "Pasif", location: "Kategori hero altı", size: "1180x160", note: "Sponsorlu kampanya dönemleri için ayrıldı." },
  { title: "Mobil ürün arası reklam", status: "Aktif", location: "Mobil ürün listesi", size: "Native card", note: "Her 6 üründen sonra gösterim mocklandı." }
];

const reports = [
  { type: "spam", target: "Prompt Library", reporter: "uimarket", date: "2026-05-08" },
  { type: "sahte ilan", target: "Crypto Wallet Clone", reporter: "studioalp", date: "2026-05-07" },
  { type: "uygunsuz içerik", target: "Unknown Script Pack", reporter: "kodlab", date: "2026-05-06" }
];

const sections = ["Genel özet", "Onay bekleyen ilanlar", "Yayındaki ilanlar", "Reddedilen ilanlar", "Kullanıcılar", "Raporlanan içerikler", "Reklam alanları"];

function formatPrice(listing: Listing) {
  if (listing.is_free) {
    return "Ücretsiz";
  }

  if (typeof listing.price === "number") {
    return `${listing.price.toLocaleString("tr-TR")} TL`;
  }

  return "Fiyat yok";
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function statusLabel(status: ListingStatus) {
  if (status === "approved") {
    return "Yayında";
  }

  if (status === "rejected") {
    return "Reddedildi";
  }

  return "Bekliyor";
}

function listValue(values: string[] | null) {
  return values && values.length > 0 ? values.join(", ") : "-";
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
      <p className="text-xs font-black uppercase text-neutral-500">{label}</p>
      <div className="mt-1 break-words text-sm font-bold leading-6 text-brand-black">{value || "-"}</div>
    </div>
  );
}

function ListingDetailPanel({ listing, profile, onClose }: { listing: Listing; profile?: Profile; onClose: () => void }) {
  return (
    <section className="market-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 p-5">
        <div>
          <p className="tag-text text-brand-red">İlan inceleme</p>
          <h2 className="mt-2 text-2xl font-black text-brand-black">{listing.title}</h2>
        </div>
        <button type="button" onClick={onClose} className="btn-outline">
          Kapat
        </button>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[360px_1fr]">
        <div className="overflow-hidden rounded-xl ring-1 ring-neutral-200">
          <ProductVisual accent="from-red-600 via-neutral-950 to-neutral-800" title={listing.title} thumbnailUrl={listing.thumbnail_url} variant="cover" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailField label="Başlık" value={listing.title} />
          <DetailField label="Status" value={statusLabel(listing.status)} />
          <DetailField label="Kategori slug" value={listing.category_slug} />
          <DetailField label="Alt kategori slug" value={listing.subcategory_slug} />
          <DetailField label="Fiyat" value={formatPrice(listing)} />
          <DetailField label="Ücretsiz / ücretli" value={listing.is_free ? "Ücretsiz" : "Ücretli"} />
          <DetailField label="Tags" value={listValue(listing.tags)} />
          <DetailField label="Tech stack" value={listValue(listing.tech_stack)} />
          <DetailField label="Demo URL" value={listing.demo_url} />
          <DetailField label="YouTube URL" value={listing.youtube_url} />
          <DetailField label="Thumbnail URL" value={listing.thumbnail_url} />
          <DetailField label="Kullanıcı" value={profile ? `${profile.display_name} (@${profile.username}) - ${listing.user_id}` : listing.user_id} />
          <div className="sm:col-span-2">
            <DetailField label="Açıklama" value={listing.description} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ListingsTable({
  listings,
  profilesByUserId,
  onInspect,
  onStatusChange
}: {
  listings: Listing[];
  profilesByUserId: Map<string, Profile>;
  onInspect: (listingId: string) => void;
  onStatusChange: (listingId: string, status: "approved" | "rejected") => Promise<void>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-left">
        <thead className="bg-neutral-50">
          <tr>
            {["İlan adı", "Kullanıcı", "Kategori", "Alt kategori", "Fiyat", "Ücretsiz", "Durum", "Tarih", "İşlem"].map((heading) => (
              <th key={heading} className="border-b border-neutral-100 px-5 py-4 text-xs font-black uppercase text-neutral-500">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {listings.length > 0 ? (
            listings.map((listing) => {
              const profile = profilesByUserId.get(listing.user_id);

              return (
                <tr key={listing.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-4 text-sm font-black text-brand-black">{listing.title}</td>
                  <td className="px-5 py-4 text-sm font-bold text-neutral-600">{profile ? `@${profile.username}` : listing.user_id}</td>
                  <td className="px-5 py-4 text-sm font-bold text-neutral-600">{listing.category_slug ?? "-"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-neutral-600">{listing.subcategory_slug ?? "-"}</td>
                  <td className="px-5 py-4 text-sm font-black text-brand-black">{formatPrice(listing)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-neutral-600">{listing.is_free ? "Evet" : "Hayır"}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-brand-red ring-1 ring-red-100">{statusLabel(listing.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-neutral-500">{formatDate(listing.created_at)}</td>
                  <td className="px-5 py-4">
                    <AdminActions listingId={listing.id} listingTitle={listing.title} onInspect={onInspect} onStatusChange={onStatusChange} />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={9} className="px-5 py-8 text-center text-sm font-bold text-neutral-500">
                Bu durumda ilan bulunmuyor.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [profilesByUserId, setProfilesByUserId] = useState<Map<string, Profile>>(new Map());
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const pendingListings = useMemo(() => listings.filter((listing) => listing.status === "pending"), [listings]);
  const approvedListings = useMemo(() => listings.filter((listing) => listing.status === "approved"), [listings]);
  const rejectedListings = useMemo(() => listings.filter((listing) => listing.status === "rejected"), [listings]);
  const selectedListing = useMemo(() => listings.find((listing) => listing.id === selectedListingId) ?? null, [listings, selectedListingId]);

  const stats = [
    { label: "Toplam ilan", value: String(listings.length) },
    { label: "Onay bekleyen", value: String(pendingListings.length) },
    { label: "Yayındaki ilan", value: String(approvedListings.length) },
    { label: "Reddedilen ilan", value: String(rejectedListings.length) },
    { label: "Raporlanan içerik", value: String(reports.length) }
  ];

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setAuthError("");

    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      if (userError) {
        console.error("Admin kullanici kontrolu basarisiz:", userError);
      }
      setIsAdmin(false);
      setAuthError("Admin panelini görüntülemek için giriş yapmalısınız.");
      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();

    if (profileError) {
      console.error("Admin profil kontrolu basarisiz:", profileError);
      setIsAdmin(false);
      setAuthError(getFriendlyAuthError(profileError.message));
      setIsLoading(false);
      return;
    }

    if (!profile?.is_admin) {
      setIsAdmin(false);
      setAuthError("Bu sayfaya erişim yetkiniz yok.");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .in("status", ["pending", "approved", "rejected"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin ilanlari yuklenemedi:", error);
      setAuthError(`İlanlar yüklenemedi: ${error.message}. Admin listings SELECT RLS policy kontrol edilmeli.`);
      setIsLoading(false);
      return;
    }

    const nextListings = data ?? [];
    const profileMap = new Map<string, Profile>();
    const userIds = Array.from(new Set(nextListings.map((listing) => listing.user_id)));

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", userIds);

      if (profilesError) {
        console.error("Admin ilan kullanici bilgileri yuklenemedi:", profilesError);
        setActionMessage(`Kullanıcı bilgileri yüklenemedi: ${profilesError.message}`);
      } else {
        (profiles ?? []).forEach((currentProfile) => {
          profileMap.set(currentProfile.id, currentProfile);
        });
      }
    }

    setListings(nextListings);
    setProfilesByUserId(profileMap);
    setIsAdmin(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  async function handleStatusChange(listingId: string, status: "approved" | "rejected") {
    setActionMessage("");
    const supabase = getSupabaseClient();
    const listing = listings.find((currentListing) => currentListing.id === listingId);
    const { error } = await supabase.from("listings").update({ status }).eq("id", listingId);

    if (error) {
      console.error("Admin ilan durumu guncellenemedi:", error);
      setActionMessage("İlan durumu güncellenemedi. Lütfen yetkinizi ve RLS politikasını kontrol edin.");
      throw error;
    }

    setActionMessage(status === "approved" ? "İlan onaylandı." : "İlan reddedildi.");
    if (listing) {
      const notificationType = status === "approved" ? "listing_approved" : "listing_rejected";
      const notificationTitle = status === "approved" ? "İlanınız onaylandı." : "İlanınız reddedildi.";
      const notificationBody =
        status === "approved"
          ? `"${listing.title}" ilanınız admin onayından geçti ve yayına alındı.`
          : `"${listing.title}" ilanınız reddedildi. Lütfen ilan bilgilerinizi gözden geçirin.`;
      const notificationLink = status === "approved" ? `/urun/${listing.slug}` : `/ilanlarim/${listing.id}/duzenle`;

      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: listing.user_id,
        type: notificationType,
        title: notificationTitle,
        body: notificationBody,
        link_url: notificationLink
      });

      if (notificationError) {
        console.error("Bildirim olusturulamadi:", notificationError);
      }
    }

    await loadAdminData();
  }

  if (isLoading) {
    return (
      <div className="market-card p-6">
        <p className="text-sm font-bold text-neutral-600">Admin yetkisi ve ilanlar kontrol ediliyor...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="market-card bg-red-50 p-5 ring-1 ring-red-100">
        <p className="text-sm font-bold leading-6 text-brand-red">{authError}</p>
        {authError.includes("giriş") ? (
          <Link href="/giris" className="btn-primary mt-4 inline-flex">
            Giriş Yap
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="market-card mb-6 bg-red-50 p-4 ring-1 ring-red-100">
        <p className="text-sm font-bold leading-6 text-brand-red">
          Bu ekran yalnızca admin kullanıcılar içindir. İşlemler Supabase Auth ve profiles.is_admin kontrolü ile yapılır.
        </p>
        {actionMessage ? <p className="mt-2 text-sm font-black text-brand-red">{actionMessage}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside className="market-card sticky top-24 overflow-hidden p-3">
          <nav className="grid gap-1">
            {sections.map((section, index) => (
              <a
                key={section}
                href={`#${section.toLowerCase().replaceAll(" ", "-")}`}
                className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                  index === 0 ? "bg-neutral-950 text-brand-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-brand-black"
                }`}
              >
                {section}
              </a>
            ))}
          </nav>
        </aside>

        <main className="grid min-w-0 gap-6">
          <section id="genel-özet">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {stats.map((stat) => (
                <article key={stat.label} className="market-card p-5">
                  <p className="text-xs font-black uppercase text-neutral-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-black text-brand-black">{stat.value}</p>
                </article>
              ))}
            </div>
          </section>

          {selectedListing ? (
            <ListingDetailPanel listing={selectedListing} profile={profilesByUserId.get(selectedListing.user_id)} onClose={() => setSelectedListingId(null)} />
          ) : null}

          <section id="onay-bekleyen-ilanlar" className="market-card overflow-hidden">
            <div className="border-b border-neutral-100 p-5">
              <p className="tag-text text-brand-red">Moderasyon</p>
              <h2 className="mt-2 text-2xl font-black text-brand-black">Onay bekleyen ilanlar</h2>
            </div>
            <ListingsTable listings={pendingListings} profilesByUserId={profilesByUserId} onInspect={setSelectedListingId} onStatusChange={handleStatusChange} />
          </section>

          <section id="yayındaki-ilanlar" className="market-card overflow-hidden">
            <div className="border-b border-neutral-100 p-5">
              <p className="tag-text text-brand-red">Yayın</p>
              <h2 className="mt-2 text-2xl font-black text-brand-black">Yayındaki ilanlar</h2>
            </div>
            <ListingsTable listings={approvedListings} profilesByUserId={profilesByUserId} onInspect={setSelectedListingId} onStatusChange={handleStatusChange} />
          </section>

          <section id="reddedilen-ilanlar" className="market-card overflow-hidden">
            <div className="border-b border-neutral-100 p-5">
              <p className="tag-text text-brand-red">Ret</p>
              <h2 className="mt-2 text-2xl font-black text-brand-black">Reddedilen ilanlar</h2>
            </div>
            <ListingsTable listings={rejectedListings} profilesByUserId={profilesByUserId} onInspect={setSelectedListingId} onStatusChange={handleStatusChange} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article id="kullanıcılar" className="market-card p-5">
              <p className="tag-text text-brand-red">Kullanıcılar</p>
              <h2 className="mt-2 text-2xl font-black text-brand-black">Kullanıcılar</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">Admin yetkisi profiles.is_admin alanı üzerinden kontrol ediliyor.</p>
            </article>
            <article id="raporlanan-içerikler" className="market-card p-5">
              <p className="tag-text text-brand-red">Raporlar</p>
              <h2 className="mt-2 text-2xl font-black text-brand-black">Raporlanan içerikler</h2>
              <div className="mt-4 grid gap-3">
                {reports.map((report) => (
                  <div key={`${report.type}-${report.target}`} className="rounded-xl bg-neutral-50 p-4 ring-1 ring-neutral-100">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-brand-red">{report.type}</span>
                      <span className="text-xs font-bold text-neutral-500">{report.date}</span>
                    </div>
                    <p className="mt-3 text-sm font-black text-brand-black">{report.target}</p>
                    <p className="mt-1 text-xs font-bold text-neutral-500">Raporlayan: @{report.reporter}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section id="reklam-alanları" className="market-card p-5">
            <div className="mb-5">
              <p className="tag-text text-brand-red">Monetizasyon</p>
              <h2 className="mt-2 text-2xl font-black text-brand-black">Reklam alanları</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {adSlots.map((slot) => (
                <article key={slot.title} className="rounded-2xl bg-neutral-50 p-5 ring-1 ring-neutral-100">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-black text-brand-black">{slot.title}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${slot.status === "Aktif" ? "bg-red-50 text-brand-red ring-1 ring-red-100" : "bg-neutral-200 text-neutral-600"}`}>
                      {slot.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm font-semibold text-neutral-600">
                    <p>Konum: {slot.location}</p>
                    <p>Boyut: {slot.size}</p>
                    <p className="leading-6">Not: {slot.note}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
