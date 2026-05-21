"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ProductVisual } from "@/components/listings/product-visual";
import { Container } from "@/components/ui/container";
import type { Product } from "@/data/products";
import { getProfilesByUserIds, mapListingToProduct } from "@/lib/listings";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

export function FavoritesClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function loadFavorites() {
      setIsLoading(true);
      setStatusMessage("");

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (userError || !user) {
        setIsSignedIn(false);
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsSignedIn(true);

      const { data: favoriteRows, error: favoritesError } = await supabase
        .from("favorites")
        .select("listing_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (favoritesError) {
        console.error("Favoriler yüklenemedi:", favoritesError);
        setStatusMessage("Favoriler yüklenemedi. Lütfen tekrar deneyin.");
        setProducts([]);
        setIsLoading(false);
        return;
      }

      const listingIds = Array.from(new Set((favoriteRows ?? []).map((favorite) => favorite.listing_id)));

      if (listingIds.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      const { data: listings, error: listingsError } = await supabase
        .from("listings")
        .select("*")
        .in("id", listingIds)
        .eq("status", "approved");

      if (!isMounted) {
        return;
      }

      if (listingsError) {
        console.error("Favori ilanlar yüklenemedi:", listingsError);
        setStatusMessage("Favori ilanlar yüklenemedi. Lütfen tekrar deneyin.");
        setProducts([]);
        setIsLoading(false);
        return;
      }

      const approvedListings = (listings ?? []) as ListingRow[];
      const profileMap = await getProfilesByUserIds(Array.from(new Set(approvedListings.map((listing) => listing.user_id))));

      if (!isMounted) {
        return;
      }

      const listingOrder = new Map(listingIds.map((listingId, index) => [listingId, index]));
      const favoriteProducts = approvedListings
        .sort((first, second) => (listingOrder.get(first.id) ?? 0) - (listingOrder.get(second.id) ?? 0))
        .map((listing) => mapListingToProduct(listing, profileMap.get(listing.user_id)));

      setProducts(favoriteProducts);
      setIsLoading(false);
    }

    void loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-12 md:py-16">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            Favoriler
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            Beğendiğin dijital ürünleri tek yerde takip et.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            Favori ilanlarını, demo incelemelerini ve satın alma adaylarını düzenli bir marketplace görünümünde sakla.
          </p>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          {!isSignedIn && !isLoading ? (
            <div className="market-card mb-6 bg-red-50 p-4 ring-1 ring-red-100">
              <p className="text-sm font-bold leading-6 text-brand-red">
                Favorilerinizi görüntülemek için giriş yapmalısınız.
              </p>
            </div>
          ) : null}

          {statusMessage ? (
            <div className="market-card mb-6 bg-red-50 p-4 ring-1 ring-red-100">
              <p className="text-sm font-bold leading-6 text-brand-red">{statusMessage}</p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="market-card p-10 text-center">
              <p className="text-sm font-bold text-neutral-500">Favoriler yükleniyor...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article key={product.id} className="market-card relative min-w-0 overflow-hidden">
                  <FavoriteButton
                    listingId={product.id}
                    onFavoriteChange={(isFavorite) => {
                      if (!isFavorite) {
                        setProducts((currentProducts) => currentProducts.filter((currentProduct) => currentProduct.id !== product.id));
                      }
                    }}
                  />
                  <Link href={`/urun/${product.slug}`} className="block">
                    <ProductVisual accent={product.images[0]} title={product.title} thumbnailUrl={product.thumbnailUrl} />
                    <div className="p-5">
                      <p className="text-xs font-black uppercase text-brand-red">{product.category}</p>
                      <h2 className="mt-1 text-xl font-black leading-7 text-brand-black">{product.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{product.shortDescription}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {product.techStack.slice(0, 3).map((tech) => (
                          <span key={tech} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                        <span className="text-sm font-black text-brand-black">{product.price}</span>
                        <span className="text-sm font-black text-brand-red">İncele</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="market-card p-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-950 text-xl font-black text-brand-white">
                0
              </div>
              <h2 className="text-2xl font-black text-brand-black">Henüz favori ilanınız yok.</h2>
              <p className="mt-3 text-sm font-semibold text-neutral-600">Beğendiğiniz ürünleri favorilere eklediğinizde burada görünür.</p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
