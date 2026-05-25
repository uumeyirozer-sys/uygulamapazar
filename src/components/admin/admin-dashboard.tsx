"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminActions } from "@/components/admin/admin-actions";
import { ProductVisual } from "@/components/listings/product-visual";
import { getFriendlyAuthError } from "@/lib/auth";
import { getSupabaseClient, type Database } from "@/lib/supabase";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

type Listing = Database["public"]["Tables"]["listings"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type HomepageProfile = Database["public"]["Tables"]["homepage_profiles"]["Row"];
type FeaturedSlot = Database["public"]["Tables"]["featured_slots"]["Row"];
type ListingStatus = Listing["status"];

const sections = ["Genel Özet", "İlan Yönetimi", "Kullanıcılar", "Popüler Profiller", "Sponsorlu Ürün", "Reklam Alanları", "Raporlar"];
const statusTabs: Array<{ label: string; value: "all" | ListingStatus }> = [
  { label: "Tümü", value: "all" },
  { label: "Onay bekleyen", value: "pending" },
  { label: "Yayındaki", value: "approved" },
  { label: "Reddedilen", value: "rejected" }
];

const adSlots = [
  { title: "Sidebar reklam", status: "Aktif", location: "Ürün detay sağ panel", size: "300x250" },
  { title: "Ürün arası native reklam", status: "Aktif", location: "Kategori ürün grid", size: "Full width" },
  { title: "Kategori üstü banner", status: "Pasif", location: "Kategori hero altı", size: "1180x160" },
  { title: "Mobil ürün arası reklam", status: "Aktif", location: "Mobil ürün listesi", size: "Native card" }
];

const reports = [
  { type: "spam", target: "Prompt Library", reporter: "uimarket", date: "2026-05-08" },
  { type: "sahte ilan", target: "Crypto Wallet Clone", reporter: "studioalp", date: "2026-05-07" },
  { type: "uygunsuz içerik", target: "Unknown Script Pack", reporter: "kodlab", date: "2026-05-06" }
];

function formatPrice(listing: Listing) {
  if (listing.is_free) {
    return "Ücretsiz";
  }

  return typeof listing.price === "number" ? `${listing.price.toLocaleString("tr-TR")} TL` : "Fiyat yok";
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
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
  const youtubeEmbedUrl = getYoutubeEmbedUrl(listing.youtube_url);

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
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-xl ring-1 ring-neutral-200">
            <ProductVisual accent="from-red-600 via-neutral-950 to-neutral-800" title={listing.title} thumbnailUrl={listing.thumbnail_url} variant="cover" />
          </div>
          {listing.youtube_url && youtubeEmbedUrl ? (
            <div className="overflow-hidden rounded-xl bg-neutral-950">
              <iframe className="aspect-video w-full" src={youtubeEmbedUrl} title={`${listing.title} videosu`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
          ) : listing.youtube_url ? (
            <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-brand-red ring-1 ring-red-100">Video bağlantısı geçersiz.</div>
          ) : null}
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
          <DetailField label="Demo URL" value={listing.demo_url ? <Link href={listing.demo_url} target="_blank" className="text-brand-red">{listing.demo_url}</Link> : "-"} />
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

function UserAvatar({ profile }: { profile: Profile }) {
  const initials =
    profile.display_name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
      .join("") || "UP";

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-sm font-black text-brand-white">
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

export function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [managementMessage, setManagementMessage] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [homepageProfiles, setHomepageProfiles] = useState<HomepageProfile[]>([]);
  const [featuredSlot, setFeaturedSlot] = useState<FeaturedSlot | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [listingFilter, setListingFilter] = useState<"all" | ListingStatus>("all");

  const profilesByUserId = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const listingCountsByUserId = useMemo(() => {
    const counts = new Map<string, number>();
    listings.forEach((listing) => counts.set(listing.user_id, (counts.get(listing.user_id) ?? 0) + 1));
    return counts;
  }, [listings]);
  const pendingListings = useMemo(() => listings.filter((listing) => listing.status === "pending"), [listings]);
  const approvedListings = useMemo(() => listings.filter((listing) => listing.status === "approved"), [listings]);
  const rejectedListings = useMemo(() => listings.filter((listing) => listing.status === "rejected"), [listings]);
  const visibleListings = useMemo(() => (listingFilter === "all" ? listings : listings.filter((listing) => listing.status === listingFilter)), [listingFilter, listings]);
  const selectedListing = useMemo(() => listings.find((listing) => listing.id === selectedListingId) ?? null, [listings, selectedListingId]);
  const homepageProfileIds = useMemo(() => new Set(homepageProfiles.filter((slot) => slot.is_active !== false).map((slot) => slot.profile_id)), [homepageProfiles]);
  const sponsoredListing = useMemo(() => listings.find((listing) => listing.id === featuredSlot?.listing_id) ?? null, [featuredSlot, listings]);

  const stats = [
    { label: "Toplam ilan", value: String(listings.length) },
    { label: "Onay bekleyen", value: String(pendingListings.length) },
    { label: "Yayındaki ilan", value: String(approvedListings.length) },
    { label: "Reddedilen ilan", value: String(rejectedListings.length) },
    { label: "Kullanıcı", value: String(profiles.length) }
  ];

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setAuthError("");
    setManagementMessage("");

    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      if (userError) {
        console.error("Admin kullanıcı kontrolü başarısız:", userError);
      }
      setIsAdmin(false);
      setAuthError("Admin panelini görüntülemek için giriş yapmalısınız.");
      setIsLoading(false);
      return;
    }

    const { data: currentProfile, error: profileError } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();

    if (profileError) {
      console.error("Admin profil kontrolü başarısız:", profileError);
      setIsAdmin(false);
      setAuthError(getFriendlyAuthError(profileError.message));
      setIsLoading(false);
      return;
    }

    if (!currentProfile?.is_admin) {
      setIsAdmin(false);
      setAuthError("Bu sayfaya erişim yetkiniz yok.");
      setIsLoading(false);
      return;
    }

    const [listingsResult, profilesResult, homepageProfilesResult, featuredSlotResult] = await Promise.all([
      supabase.from("listings").select("*").in("status", ["pending", "approved", "rejected"]).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("homepage_profiles").select("*").order("sort_order", { ascending: true }),
      supabase.from("featured_slots").select("*").eq("slot_key", "homepage_sponsored_product").maybeSingle()
    ]);

    if (listingsResult.error) {
      console.error("Admin ilanları yüklenemedi:", listingsResult.error);
      setAuthError(`İlanlar yüklenemedi: ${listingsResult.error.message}. Admin listings SELECT RLS policy kontrol edilmeli.`);
      setIsLoading(false);
      return;
    }

    if (profilesResult.error) {
      console.error("Admin kullanıcıları yüklenemedi:", profilesResult.error);
      setAuthError(`Kullanıcılar yüklenemedi: ${profilesResult.error.message}. Admin profiles SELECT RLS policy kontrol edilmeli.`);
      setIsLoading(false);
      return;
    }

    if (homepageProfilesResult.error) {
      console.error("Homepage profile yönetimi yüklenemedi:", homepageProfilesResult.error);
      setManagementMessage(`Popüler Profil tablosu erişilemedi: ${homepageProfilesResult.error.message}`);
    }

    if (featuredSlotResult.error) {
      console.error("Sponsorlu ürün slotu yüklenemedi:", featuredSlotResult.error);
      setManagementMessage((current) => `${current ? `${current} ` : ""}Sponsorlu Ürün tablosu erişilemedi: ${featuredSlotResult.error.message}`);
    }

    setListings(listingsResult.data ?? []);
    setProfiles(profilesResult.data ?? []);
    setHomepageProfiles(homepageProfilesResult.data ?? []);
    setFeaturedSlot(featuredSlotResult.data ?? null);
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
      console.error("Admin ilan durumu güncellenemedi:", error);
      setActionMessage("İlan durumu güncellenemedi. Lütfen yetkinizi ve RLS politikasını kontrol edin.");
      throw error;
    }

    setActionMessage(status === "approved" ? "İlan onaylandı." : "İlan reddedildi / yayından kaldırıldı.");

    if (listing && (status === "approved" || status === "rejected")) {
      const notificationType = status === "approved" ? "listing_approved" : "listing_rejected";
      const notificationTitle = status === "approved" ? "İlanınız onaylandı." : "İlanınız reddedildi.";
      const notificationBody =
        status === "approved"
          ? `"${listing.title}" ilanınız admin onayından geçti ve yayına alındı.`
          : `"${listing.title}" ilanınız reddedildi veya yayından kaldırıldı. Lütfen ilan bilgilerinizi gözden geçirin.`;
      const notificationLink = status === "approved" ? `/urun/${listing.slug}` : `/ilanlarim/${listing.id}/duzenle`;

      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: listing.user_id,
        type: notificationType,
        title: notificationTitle,
        body: notificationBody,
        link_url: notificationLink
      });

      if (notificationError) {
        console.error("Bildirim oluşturulamadı:", notificationError);
      }
    }

    await loadAdminData();
  }

  async function handleDeleteListing(listingId: string) {
    setActionMessage("");
    const confirmed = window.confirm("Bu ilan kalıcı olarak silinsin mi?");

    if (!confirmed) {
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("listings").delete().eq("id", listingId);

    if (error) {
      console.error("Admin ilan silemedi:", error);
      setActionMessage(`İlan silinemedi: ${error.message}`);
      return;
    }

    setActionMessage("İlan silindi.");
    setSelectedListingId(null);
    await loadAdminData();
  }

  async function handleToggleHomepageProfile(profile: Profile) {
    setManagementMessage("");
    const supabase = getSupabaseClient();
    const existingSlot = homepageProfiles.find((slot) => slot.profile_id === profile.id);

    if (existingSlot) {
      const { error } = await supabase.from("homepage_profiles").update({ is_active: !existingSlot.is_active }).eq("id", existingSlot.id);

      if (error) {
        console.error("Popüler profil güncellenemedi:", error);
        setManagementMessage(`Popüler profil güncellenemedi: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase.from("homepage_profiles").insert({
        profile_id: profile.id,
        sort_order: homepageProfiles.length,
        is_active: true
      });

      if (error) {
        console.error("Popüler profile eklenemedi:", error);
        setManagementMessage(`Popüler profile eklenemedi: ${error.message}`);
        return;
      }
    }

    setManagementMessage("Popüler profiller güncellendi.");
    await loadAdminData();
  }

  async function handleSetSponsoredProduct(listingId: string) {
    setManagementMessage("");
    const supabase = getSupabaseClient();
    const payload = {
      slot_key: "homepage_sponsored_product",
      listing_id: listingId || null,
      is_active: Boolean(listingId),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from("featured_slots").upsert(payload, { onConflict: "slot_key" });

    if (error) {
      console.error("Sponsorlu ürün güncellenemedi:", error);
      setManagementMessage(`Sponsorlu ürün güncellenemedi: ${error.message}`);
      return;
    }

    setManagementMessage("Sponsorlu ürün güncellendi.");
    await loadAdminData();
  }

  if (isLoading) {
    return (
      <div className="market-card p-6">
        <p className="text-sm font-bold text-neutral-600">Admin yetkisi ve yönetim verileri kontrol ediliyor...</p>
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
        <p className="text-sm font-bold leading-6 text-brand-red">Bu ekran yalnızca admin kullanıcılar içindir. İşlemler Supabase Auth ve profiles.is_admin kontrolü ile yapılır.</p>
        {actionMessage ? <p className="mt-2 text-sm font-black text-brand-red">{actionMessage}</p> : null}
        {managementMessage ? <p className="mt-2 text-sm font-black text-neutral-700">{managementMessage}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside className="market-card sticky top-24 overflow-hidden p-3">
          <nav className="grid gap-1">
            {sections.map((section, index) => (
              <a key={section} href={`#${section.toLowerCase().replaceAll(" ", "-")}`} className={`rounded-xl px-4 py-3 text-sm font-black transition ${index === 0 ? "bg-neutral-950 text-brand-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-brand-black"}`}>
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

          <section id="ilan-yönetimi" className="market-card overflow-hidden">
            <div className="border-b border-neutral-100 p-5">
              <p className="tag-text text-brand-red">Moderasyon</p>
              <h2 className="mt-2 text-2xl font-black text-brand-black">İlan Yönetimi</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {statusTabs.map((tab) => (
                  <button key={tab.value} type="button" onClick={() => setListingFilter(tab.value)} className={`rounded-full px-4 py-2 text-sm font-black transition ${listingFilter === tab.value ? "bg-neutral-950 text-brand-white" : "bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-brand-red"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left">
                <thead className="bg-neutral-50">
                  <tr>
                    {["İlan adı", "Kullanıcı", "Kategori", "Fiyat", "Durum", "Tarih", "İşlem"].map((heading) => (
                      <th key={heading} className="border-b border-neutral-100 px-5 py-4 text-xs font-black uppercase text-neutral-500">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleListings.length > 0 ? (
                    visibleListings.map((listing) => (
                      <tr key={listing.id} className="border-b border-neutral-100 last:border-0">
                        <td className="px-5 py-4 text-sm font-black text-brand-black">{listing.title}</td>
                        <td className="px-5 py-4 text-sm font-bold text-neutral-600">{profilesByUserId.get(listing.user_id)?.username ?? listing.user_id}</td>
                        <td className="px-5 py-4 text-sm font-bold text-neutral-600">{listing.category_slug ?? "-"}</td>
                        <td className="px-5 py-4 text-sm font-black text-brand-black">{formatPrice(listing)}</td>
                        <td className="px-5 py-4"><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-brand-red ring-1 ring-red-100">{statusLabel(listing.status)}</span></td>
                        <td className="px-5 py-4 text-sm font-bold text-neutral-500">{formatDate(listing.created_at)}</td>
                        <td className="px-5 py-4">
                          <AdminActions listingId={listing.id} listingTitle={listing.title} onDelete={handleDeleteListing} onInspect={setSelectedListingId} onStatusChange={handleStatusChange} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm font-bold text-neutral-500">Bu filtrede ilan bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {selectedListing ? <ListingDetailPanel listing={selectedListing} profile={profilesByUserId.get(selectedListing.user_id)} onClose={() => setSelectedListingId(null)} /> : null}

          <section id="kullanıcılar" className="market-card overflow-hidden">
            <div className="border-b border-neutral-100 p-5">
              <p className="tag-text text-brand-red">Üyeler</p>
              <h2 className="mt-2 text-2xl font-black text-brand-black">Kullanıcılar</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead className="bg-neutral-50">
                  <tr>
                    {["Avatar", "username", "display_name", "is_admin", "created_at", "ilan sayısı"].map((heading) => (
                      <th key={heading} className="border-b border-neutral-100 px-5 py-4 text-xs font-black uppercase text-neutral-500">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="border-b border-neutral-100 last:border-0">
                      <td className="px-5 py-4"><UserAvatar profile={profile} /></td>
                      <td className="px-5 py-4 text-sm font-black text-brand-black">@{profile.username}</td>
                      <td className="px-5 py-4 text-sm font-bold text-neutral-600">{profile.display_name}</td>
                      <td className="px-5 py-4 text-sm font-bold text-neutral-600">{profile.is_admin ? "Evet" : "Hayır"}</td>
                      <td className="px-5 py-4 text-sm font-bold text-neutral-500">{formatDate(profile.created_at)}</td>
                      <td className="px-5 py-4 text-sm font-black text-brand-black">{listingCountsByUserId.get(profile.id) ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="popüler-profiller" className="market-card p-5">
            <p className="tag-text text-brand-red">Ana sayfa vitrini</p>
            <h2 className="mt-2 text-2xl font-black text-brand-black">Popüler Profiller</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {profiles.map((profile) => {
                const isSelected = homepageProfileIds.has(profile.id);

                return (
                  <div key={profile.id} className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 p-4 ring-1 ring-neutral-100">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar profile={profile} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-brand-black">{profile.display_name}</p>
                        <p className="truncate text-xs font-bold text-neutral-500">@{profile.username}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => void handleToggleHomepageProfile(profile)} className={isSelected ? "btn-secondary shrink-0" : "btn-outline shrink-0"}>
                      {isSelected ? "Popüler profilden çıkar" : "Popüler profile ekle"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="sponsorlu-ürün" className="market-card p-5">
            <p className="tag-text text-brand-red">Ana sayfa vitrini</p>
            <h2 className="mt-2 text-2xl font-black text-brand-black">Sponsorlu Ürün</h2>
            <p className="mt-3 text-sm font-bold text-neutral-600">Seçili ürün: {sponsoredListing?.title ?? "Yok, ana sayfa fallback sponsor kartını kullanır."}</p>
            <div className="mt-5 grid gap-3">
              <select value={featuredSlot?.listing_id ?? ""} onChange={(event) => void handleSetSponsoredProduct(event.target.value)} className="min-h-12 rounded-lg border border-neutral-300 bg-brand-white px-4 text-sm font-bold text-brand-black">
                <option value="">Sponsorlu ürün seçilmedi</option>
                {approvedListings.map((listing) => (
                  <option key={listing.id} value={listing.id}>{listing.title}</option>
                ))}
              </select>
              {sponsoredListing ? (
                <div className="grid gap-4 rounded-xl bg-neutral-50 p-4 ring-1 ring-neutral-100 md:grid-cols-[220px_1fr]">
                  <div className="overflow-hidden rounded-lg"><ProductVisual accent="from-red-600 via-neutral-950 to-neutral-800" title={sponsoredListing.title} thumbnailUrl={sponsoredListing.thumbnail_url} compact /></div>
                  <div>
                    <p className="text-lg font-black text-brand-black">{sponsoredListing.title}</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{sponsoredListing.short_description}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section id="reklam-alanları" className="market-card p-5">
            <p className="tag-text text-brand-red">Monetizasyon</p>
            <h2 className="mt-2 text-2xl font-black text-brand-black">Reklam Alanları</h2>
            <p className="mt-3 text-sm font-bold text-neutral-600">Bu alan ileride Google Ads/AdSense veya sponsorlu kampanya ile yönetilecek.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {adSlots.map((slot) => (
                <article key={slot.title} className="rounded-xl bg-neutral-50 p-5 ring-1 ring-neutral-100">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-black text-brand-black">{slot.title}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${slot.status === "Aktif" ? "bg-red-50 text-brand-red ring-1 ring-red-100" : "bg-neutral-200 text-neutral-600"}`}>{slot.status}</span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm font-semibold text-neutral-600">
                    <p>Konum: {slot.location}</p>
                    <p>Boyut: {slot.size}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="raporlar" className="market-card p-5">
            <p className="tag-text text-brand-red">Mock veri</p>
            <h2 className="mt-2 text-2xl font-black text-brand-black">Raporlar</h2>
            <p className="mt-3 text-sm font-bold text-neutral-600">Rapor sistemi henüz gerçek tabloya bağlı değil; aşağıdaki kayıtlar mock veridir.</p>
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
          </section>
        </main>
      </div>
    </>
  );
}
