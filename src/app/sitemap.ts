import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

const staticRoutes = [
  "/",
  "/kategoriler",
  "/kategori/uygulamalar",
  "/kategori/oyunlar",
  "/kategori/web-scriptleri",
  "/hakkimizda",
  "/iletisim",
  "/ilan-kurallari",
  "/kullanim-sartlari",
  "/gizlilik-politikasi"
];

async function getApprovedListingRoutes() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("listings")
      .select("slug,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return (data as Pick<ListingRow, "slug" | "created_at">[]).map((listing) => ({
      url: `${siteUrl}/urun/${listing.slug}`,
      lastModified: listing.created_at ? new Date(listing.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.8
  }));

  return [...staticEntries, ...(await getApprovedListingRoutes())];
}
