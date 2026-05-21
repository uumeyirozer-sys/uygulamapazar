import type { Metadata } from "next";
import Link from "next/link";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ProductVisual } from "@/components/listings/product-visual";
import { Container } from "@/components/ui/container";
import { categories } from "@/data/categories";
import type { Product } from "@/data/products";
import { getApprovedListingProducts } from "@/lib/listings";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    kategori?: string;
    fiyat?: string;
    teknoloji?: string;
    siralama?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Arama | UygulamaPazar.com",
  description: "UygulamaPazar.com approved marketplace ilanları üzerinde arama sonuçları."
};

function normalize(value: string) {
  return value.toLocaleLowerCase("tr-TR").trim();
}

function matchesQuery(product: Product, query: string) {
  if (!query) {
    return true;
  }

  const searchableText = [
    product.title,
    product.shortDescription,
    product.category,
    product.subcategory,
    ...product.tags,
    ...product.techStack
  ]
    .map(normalize)
    .join(" ");

  return searchableText.includes(normalize(query));
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const selectedCategory = params.kategori ?? "";
  const selectedPrice = params.fiyat ?? "";
  const selectedTech = params.teknoloji ?? "";
  const selectedSort = params.siralama ?? "populer";

  const marketplaceProducts = await getApprovedListingProducts({ fallback: true });
  const techOptions = Array.from(new Set(marketplaceProducts.flatMap((product) => product.techStack))).slice(0, 10);

  const filteredProducts = marketplaceProducts
    .filter((product) => matchesQuery(product, query))
    .filter((product) => (selectedCategory ? product.category === selectedCategory : true))
    .filter((product) => {
      if (selectedPrice === "ucretsiz") {
        return product.price.toLocaleLowerCase("tr-TR").includes("ücretsiz");
      }

      if (selectedPrice === "ucretli") {
        return !product.price.toLocaleLowerCase("tr-TR").includes("ücretsiz");
      }

      return true;
    })
    .filter((product) => (selectedTech ? product.techStack.includes(selectedTech) : true))
    .sort((a, b) => {
      if (selectedSort === "en-yeni") {
        return b.createdAt.localeCompare(a.createdAt);
      }

      if (selectedSort === "ucretsiz") {
        return a.price.localeCompare(b.price);
      }

      return b.views.localeCompare(a.views);
    });

  function filterHref(overrides: Record<string, string>) {
    const nextParams = new URLSearchParams();
    if (query) nextParams.set("q", query);
    if (selectedCategory) nextParams.set("kategori", selectedCategory);
    if (selectedPrice) nextParams.set("fiyat", selectedPrice);
    if (selectedTech) nextParams.set("teknoloji", selectedTech);
    if (selectedSort) nextParams.set("siralama", selectedSort);

    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });

    return `/arama?${nextParams.toString()}`;
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-12 md:py-16">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            Arama
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            {query ? `"${query}" için arama sonuçları` : "Marketplace ürünlerinde ara"}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            {filteredProducts.length} sonuç bulundu. Ürünleri kategori, fiyat, teknoloji ve sıralama seçenekleriyle daraltın.
          </p>

          <form action="/arama" className="mt-7 max-w-2xl rounded-xl border border-white/12 bg-white/95 p-2.5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                name="q"
                defaultValue={query}
                className="min-h-12 flex-1 rounded-lg bg-neutral-50 px-4 text-sm font-semibold text-brand-black outline-none ring-1 ring-neutral-200 transition focus:bg-brand-white focus:ring-brand-red/40"
                placeholder="Ürün, kategori veya teknoloji ara"
              />
              <button type="submit" className="btn-primary min-h-12 px-7">
                Ara
              </button>
            </div>
          </form>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          <div className="market-card mb-6 grid gap-4 p-4 lg:grid-cols-4">
            <div>
              <p className="mb-2 text-xs font-black uppercase text-neutral-500">Kategori</p>
              <div className="flex flex-wrap gap-2">
                <Link href={filterHref({ kategori: "" })} className={`rounded-full px-3 py-1.5 text-xs font-black ${!selectedCategory ? "bg-neutral-950 text-brand-white" : "bg-neutral-100 text-neutral-700"}`}>
                  Tümü
                </Link>
                {categories.map((category) => (
                  <Link key={category.slug} href={filterHref({ kategori: category.title })} className={`rounded-full px-3 py-1.5 text-xs font-black ${selectedCategory === category.title ? "bg-neutral-950 text-brand-white" : "bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-brand-red"}`}>
                    {category.title}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-black uppercase text-neutral-500">Fiyat</p>
              <div className="flex flex-wrap gap-2">
                {[
                  ["", "Tümü"],
                  ["ucretli", "Ücretli"],
                  ["ucretsiz", "Ücretsiz"]
                ].map(([value, label]) => (
                  <Link key={value || "all"} href={filterHref({ fiyat: value })} className={`rounded-full px-3 py-1.5 text-xs font-black ${selectedPrice === value ? "bg-neutral-950 text-brand-white" : "bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-brand-red"}`}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-black uppercase text-neutral-500">Teknoloji</p>
              <div className="flex flex-wrap gap-2">
                <Link href={filterHref({ teknoloji: "" })} className={`rounded-full px-3 py-1.5 text-xs font-black ${!selectedTech ? "bg-neutral-950 text-brand-white" : "bg-neutral-100 text-neutral-700"}`}>
                  Tümü
                </Link>
                {techOptions.map((tech) => (
                  <Link key={tech} href={filterHref({ teknoloji: tech })} className={`rounded-full px-3 py-1.5 text-xs font-black ${selectedTech === tech ? "bg-neutral-950 text-brand-white" : "bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-brand-red"}`}>
                    {tech}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-black uppercase text-neutral-500">Sıralama</p>
              <div className="flex flex-wrap gap-2">
                {[
                  ["populer", "Popüler"],
                  ["en-yeni", "En yeni"],
                  ["ucretsiz", "Ücretsiz"]
                ].map(([value, label]) => (
                  <Link key={value} href={filterHref({ siralama: value })} className={`rounded-full px-3 py-1.5 text-xs font-black ${selectedSort === value ? "bg-neutral-950 text-brand-white" : "bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-brand-red"}`}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article key={product.id} className="market-card relative min-w-0 overflow-hidden">
                  <FavoriteButton listingId={product.id} />
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
              <h2 className="text-2xl font-black text-brand-black">Sonuç bulunamadı</h2>
              <p className="mt-3 text-sm font-semibold text-neutral-600">Farklı bir anahtar kelime deneyin.</p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
