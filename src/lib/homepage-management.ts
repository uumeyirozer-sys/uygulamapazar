import { products } from "@/data/products";
import { getApprovedListingProducts, getProfilesByUserIds, mapListingToProduct } from "@/lib/listings";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type HomepageProfile = Database["public"]["Tables"]["homepage_profiles"]["Row"];

export type HomepageProfileCard = {
  id: string;
  name: string;
  handle: string;
  products: string;
  initials: string;
  score: string;
  username: string;
  avatarUrl?: string | null;
};

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

function fallbackProfileCards(): HomepageProfileCard[] {
  return [
    { id: "fallback-studioalp", name: "Studio Alp", handle: "@studioalp", products: "38 ürün", initials: "SA", score: "98%", username: "studioalp" },
    { id: "fallback-gameforge", name: "GameForge", handle: "@gameforge", products: "24 ürün", initials: "GF", score: "96%", username: "gameforge" },
    { id: "fallback-kodlab", name: "KodLab", handle: "@kodlab", products: "51 ürün", initials: "KL", score: "99%", username: "kodlab" },
    { id: "fallback-kodustasi", name: "Kod Ustası", handle: "@kodustasi", products: "42 ürün", initials: "KU", score: "97%", username: "kodustasi" }
  ];
}

async function getListingCountsByUserIds(userIds: string[]) {
  const productsByUserId = new Map<string, number>();

  if (userIds.length === 0) {
    return productsByUserId;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("listings").select("user_id").eq("status", "approved").in("user_id", userIds);

    if (error) {
      console.error("Ana sayfa profil ilan sayilari okunamadi:", error);
      return productsByUserId;
    }

    (data ?? []).forEach((listing) => {
      productsByUserId.set(listing.user_id, (productsByUserId.get(listing.user_id) ?? 0) + 1);
    });
  } catch (error) {
    console.error("Ana sayfa profil ilan sayilari sorgusu calismadi:", error);
    return productsByUserId;
  }

  return productsByUserId;
}

function mapProfileCard(profile: Profile, count: number): HomepageProfileCard {
  return {
    id: profile.id,
    name: profile.display_name,
    handle: `@${profile.username}`,
    products: `${count} ürün`,
    initials: getInitials(profile.display_name),
    score: profile.is_admin ? "Admin" : "Yeni",
    username: profile.username,
    avatarUrl: profile.avatar_url
  };
}

export async function getHomepageProfileCards() {
  try {
    const supabase = getSupabaseClient();
    const { data: slots, error } = await supabase
      .from("homepage_profiles")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(4);

    if (error) {
      console.error("Ana sayfa populer profil slotlari okunamadi:", error);
      return fallbackProfileCards();
    }

    if (!slots || slots.length === 0) {
      return fallbackProfileCards();
    }

    const typedSlots = slots as HomepageProfile[];
    const profileIds = typedSlots.map((slot) => slot.profile_id);
    const profileMap = await getProfilesByUserIds(profileIds);

    if (profileMap.size === 0) {
      console.error(
        "Ana sayfa populer profil kayitlari var ama profiles detaylari okunamadi. Public profiles SELECT policy kontrol edilmeli.",
        { profileIds }
      );
    }

    const counts = await getListingCountsByUserIds(profileIds);
    const cards = typedSlots
      .map((slot) => {
        const profile = profileMap.get(slot.profile_id);
        return profile ? mapProfileCard(profile, counts.get(profile.id) ?? 0) : null;
      })
      .filter((card): card is HomepageProfileCard => Boolean(card));

    if (cards.length === 0) {
      console.error("Ana sayfa populer profil karti uretilemedi; fallback kullaniliyor.", { slots: typedSlots });
      return fallbackProfileCards();
    }

    return cards;
  } catch (error) {
    console.error("Ana sayfa populer profil akisi calismadi:", error);
    return fallbackProfileCards();
  }
}

export async function getHomepageSponsoredProduct() {
  try {
    const supabase = getSupabaseClient();
    const { data: slot, error } = await supabase
      .from("featured_slots")
      .select("*")
      .eq("slot_key", "homepage_sponsored_product")
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Ana sayfa sponsorlu urun slotu okunamadi:", error);
      return products[0];
    }

    if (!slot?.listing_id) {
      return products[0];
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", slot.listing_id)
      .eq("status", "approved")
      .maybeSingle();

    if (listingError) {
      console.error("Ana sayfa sponsorlu urun ilani okunamadi:", listingError);
      return products[0];
    }

    if (!listing) {
      console.error("Ana sayfa sponsorlu urun slotu bir ilana bagli ama ilan bulunamadi veya approved degil.", {
        listingId: slot.listing_id
      });
      return products[0];
    }

    const profileMap = await getProfilesByUserIds([listing.user_id]);
    return {
      ...mapListingToProduct(listing, profileMap.get(listing.user_id)),
      sponsored: true
    };
  } catch (error) {
    console.error("Ana sayfa sponsorlu urun akisi calismadi:", error);
    const approvedProducts = await getApprovedListingProducts({ fallback: true, limit: 1 });
    return approvedProducts[0] ?? products[0];
  }
}
