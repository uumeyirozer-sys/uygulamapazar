import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { Container } from "@/components/ui/container";
import { MessageModalButton } from "@/components/profile/message-modal-button";
import { OwnProfileEditLink } from "@/components/profile/own-profile-edit-link";
import { getUserByUsername } from "@/data/users";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export const dynamic = "force-dynamic";

async function getSupabaseProfileByUsername(username: string): Promise<ProfileRow | null> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();

    return data;
  } catch {
    return null;
  }
}

async function getProfileListings(profileId: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", profileId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getSupabaseProfileByUsername(username);
  const user = getUserByUsername(username);

  if (!user && !profile) {
    return {};
  }

  const displayName = profile?.display_name ?? user?.displayName ?? username;
  const bio = profile?.bio ?? user?.bio ?? "";

  return {
    title: `${displayName} (@${username}) | UygulamaPazar.com`,
    description: bio
  };
}

function getInitials(displayName: string) {
  return (
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
      .join("") || "UP"
  );
}

function ListingVisual({ listing }: { listing: ListingRow }) {
  if (listing.thumbnail_url) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={listing.thumbnail_url} alt={`${listing.title} ürün görseli`} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-red-600 via-neutral-950 to-neutral-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(229,9,20,0.22),transparent_32%)]" />
      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/15 bg-white/12 p-3 shadow-2xl backdrop-blur">
        <div className="mb-3 h-3 w-2/3 rounded-full bg-white/85" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-10 rounded-lg bg-white/20" />
          <div className="h-10 rounded-lg bg-white/30" />
          <div className="h-10 rounded-lg bg-brand-red/85" />
        </div>
      </div>
    </div>
  );
}

function formatPrice(listing: ListingRow) {
  if (listing.is_free || listing.price === null) {
    return "Ücretsiz";
  }

  return `${listing.price.toLocaleString("tr-TR")} TL`;
}

function getCategoryLabel(listing: ListingRow) {
  return listing.category_slug ?? "Marketplace";
}

function getProfileSocialLinks(value: ProfileRow["social_links"]) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { label: item.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || item, href: item };
      }

      if (
        item &&
        typeof item === "object" &&
        "href" in item &&
        typeof item.href === "string"
      ) {
        const label = "label" in item && typeof item.label === "string" ? item.label : item.href;
        return { label, href: item.href };
      }

      return null;
    })
    .filter((item): item is { label: string; href: string } => Boolean(item));
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getSupabaseProfileByUsername(username);
  const user = getUserByUsername(username);

  if (!user && !profile) {
    notFound();
  }

  const realListings = profile ? await getProfileListings(profile.id) : [];
  const displayUsername = profile?.username ?? user?.username ?? username;
  const displayName = profile?.display_name ?? user?.displayName ?? displayUsername;
  const bio = profile?.bio ?? user?.bio ?? "Bu kullanıcı henüz bio eklememiş.";
  const avatarInitials = user?.avatar ?? getInitials(displayName);
  const productCount = profile ? realListings.length : user?.productCount ?? 0;
  const totalViews = user?.totalViews ?? "0";
  const trustScore = user?.trustScore ?? "Yeni";
  const joinedAt = profile?.created_at?.slice(0, 10) ?? user?.joinedAt ?? "Yeni";
  const socialLinks = profile ? getProfileSocialLinks(profile.social_links) : user?.socialLinks ?? [];
  const mockProducts = profile ? [] : user?.products ?? [];

  return (
    <>
      <section className="bg-neutral-50">
        <Container className="py-8 md:py-12">
          <div className="market-card overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-neutral-950 via-neutral-800 to-brand-red md:h-56" />
            <div className="p-5 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                  <div className="-mt-20 flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-3xl font-black text-brand-white ring-8 ring-brand-white">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      avatarInitials
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-brand-red">@{displayUsername}</p>
                    <h1 className="mt-1 text-4xl font-black leading-tight text-brand-black">{displayName}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">{bio}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <OwnProfileEditLink profileId={profile?.id} />
                  <MessageModalButton userId={profile?.id ?? user?.id} />
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-neutral-50 p-4 ring-1 ring-neutral-100">
                  <p className="text-xs font-black uppercase text-neutral-500">Ürün</p>
                  <p className="mt-1 text-2xl font-black text-brand-black">{productCount}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-4 ring-1 ring-neutral-100">
                  <p className="text-xs font-black uppercase text-neutral-500">Görüntülenme</p>
                  <p className="mt-1 text-2xl font-black text-brand-black">{totalViews}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-100">
                  <p className="text-xs font-black uppercase text-brand-red">Güven skoru</p>
                  <p className="mt-1 text-2xl font-black text-brand-black">{trustScore}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    className="rounded-full bg-neutral-100 px-3.5 py-2 text-sm font-black text-neutral-700 ring-1 ring-neutral-200 transition hover:bg-red-50 hover:text-brand-red hover:ring-red-100"
                  >
                    {link.label}
                  </Link>
                ))}
                <span className="rounded-full bg-neutral-100 px-3.5 py-2 text-sm font-black text-neutral-600 ring-1 ring-neutral-200">
                  Katılım: {joinedAt}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-brand-white">
        <Container className="py-10">
          <div className="mb-8 border-b border-neutral-200">
            <div className="flex gap-2 overflow-x-auto pb-3">
              {["İlanlar", "Hakkında", "Favoriler"].map((tab, index) => (
                <a
                  key={tab}
                  href={`#${tab.toLowerCase().replace("ı", "i")}`}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                    index === 0 ? "bg-neutral-950 text-brand-white" : "bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-brand-red"
                  }`}
                >
                  {tab}
                </a>
              ))}
            </div>
          </div>

          <div id="ilanlar">
            <div className="mb-6">
              <p className="tag-text text-brand-red">Mağaza</p>
              <h2 className="section-title mt-2">Yayındaki ilanlar</h2>
            </div>
            {realListings.length > 0 ? (
              <div className="grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {realListings.map((listing) => (
                  <article key={listing.id} className="market-card relative min-w-0 overflow-hidden">
                    <FavoriteButton listingId={listing.id} />
                    <Link href={`/urun/${listing.slug}`} className="block">
                      <ListingVisual listing={listing} />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-black uppercase text-brand-red">{getCategoryLabel(listing)}</p>
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-black text-green-700 ring-1 ring-green-100">
                            {listing.status}
                          </span>
                        </div>
                        <h3 className="mt-1 text-xl font-black leading-7 text-brand-black">{listing.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{listing.short_description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-black text-brand-black">{formatPrice(listing)}</span>
                          <span className="text-sm font-black text-brand-red">İncele</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : mockProducts.length > 0 ? (
              <div className="grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockProducts.map((product) => (
                  <article key={product.id} className="market-card relative min-w-0 overflow-hidden">
                    <FavoriteButton listingId={product.id} />
                    <Link href={`/urun/${product.slug}`} className="block">
                      <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${product.images[0]}`} />
                      <div className="p-5">
                        <p className="text-xs font-black uppercase text-brand-red">{product.category}</p>
                        <h3 className="mt-1 text-xl font-black leading-7 text-brand-black">{product.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{product.shortDescription}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-black text-brand-black">{product.price}</span>
                          <span className="text-sm font-black text-brand-red">İncele</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="market-card p-6">
                <p className="text-sm font-bold text-neutral-600">Bu kullanıcı için yayında ilan bulunmuyor.</p>
              </div>
            )}
          </div>

          <div id="hakkinda" className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="market-card p-6">
              <h2 className="text-2xl font-black text-brand-black">Hakkında</h2>
              <p className="mt-4 text-base leading-8 text-neutral-700">{bio}</p>
            </article>
            <article id="favoriler" className="market-card bg-neutral-50 p-6">
              <h2 className="text-2xl font-black text-brand-black">Favoriler</h2>
              <p className="mt-4 text-sm leading-6 text-neutral-600">
                Favoriler sadece kullanıcıya özel olarak görüntülenir.
              </p>
            </article>
          </div>
        </Container>
      </section>
    </>
  );
}
