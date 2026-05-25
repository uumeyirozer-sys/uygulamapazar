import { categories } from "@/data/categories";
import { products, type Product } from "@/data/products";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type Listing = Database["public"]["Tables"]["listings"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const fallbackImages = [
  "from-red-600 via-neutral-950 to-neutral-800",
  "from-neutral-950 via-red-800 to-neutral-700",
  "from-neutral-800 via-neutral-950 to-red-700"
];

function getCategoryTitle(categorySlug: string | null) {
  if (!categorySlug) {
    return "Marketplace";
  }

  return categories.find((category) => category.slug === categorySlug)?.title ?? categorySlug;
}

function getSubcategoryTitle(categorySlug: string | null, subcategorySlug: string | null) {
  if (!subcategorySlug) {
    return "Genel";
  }

  const category = categories.find((item) => item.slug === categorySlug);
  return category?.subcategories.find((subcategory) => subcategory.slug === subcategorySlug)?.title ?? subcategorySlug;
}

function formatPrice(listing: Listing) {
  if (listing.is_free || listing.price === null) {
    return "Ücretsiz";
  }

  return `${listing.price.toLocaleString("tr-TR")} TL`;
}

function getInitials(displayName: string) {
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("") || "UP";
}

export function mapListingToProduct(listing: Listing, profile?: Profile): Product {
  const username = profile?.username ?? "kullanici";
  const displayName = profile?.display_name ?? username;

  return {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    shortDescription: listing.short_description,
    fullDescription: listing.description,
    category: getCategoryTitle(listing.category_slug),
    subcategory: getSubcategoryTitle(listing.category_slug, listing.subcategory_slug),
    tags: listing.tags ?? [],
    techStack: listing.tech_stack ?? [],
    images: fallbackImages,
    thumbnailUrl: listing.thumbnail_url,
    price: formatPrice(listing),
    seller: {
      id: listing.user_id,
      username,
      displayName,
      products: 0,
      trustScore: "Yeni",
      avatarInitials: getInitials(displayName),
      avatarUrl: profile?.avatar_url ?? null
    },
    views: "0",
    createdAt: listing.created_at ?? "",
    youtubeUrl: listing.youtube_url ?? "",
    demoUrl: listing.demo_url ?? "",
    featured: false,
    sponsored: false
  };
}

export async function getProfilesByUserIds(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, Profile>();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("*").in("id", userIds);

  if (error || !data) {
    if (error) {
      console.error("Profil bilgileri okunamadi:", error);
    }

    return new Map<string, Profile>();
  }

  return new Map(data.map((profile) => [profile.id, profile]));
}

export async function getApprovedListingProducts(options?: { fallback?: boolean; limit?: number }) {
  const shouldFallback = options?.fallback ?? true;
  const limit = options?.limit;

  try {
    const supabase = getSupabaseClient();
    let query = supabase.from("listings").select("*").eq("status", "approved").order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (error) {
        console.error("Approved listings okunamadi:", error);
      }

      return shouldFallback ? products : [];
    }

    const profileMap = await getProfilesByUserIds(Array.from(new Set(data.map((listing) => listing.user_id))));
    return data.map((listing) => mapListingToProduct(listing, profileMap.get(listing.user_id)));
  } catch (error) {
    console.error("Approved listings sorgusu calismadi:", error);
    return shouldFallback ? products : [];
  }
}

export async function getApprovedListingProductBySlug(slug: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "approved")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.error("Approved listing detayi okunamadi:", error);
      }

      return products.find((product) => product.slug === slug);
    }

    const profileMap = await getProfilesByUserIds([data.user_id]);
    return mapListingToProduct(data, profileMap.get(data.user_id));
  } catch (error) {
    console.error("Approved listing detayi sorgusu calismadi:", error);
    return products.find((product) => product.slug === slug);
  }
}

export async function getRelatedApprovedListingProducts(product: Product) {
  const allProducts = await getApprovedListingProducts({ fallback: true });
  return allProducts.filter((relatedProduct) => relatedProduct.id !== product.id).slice(0, 3);
}
