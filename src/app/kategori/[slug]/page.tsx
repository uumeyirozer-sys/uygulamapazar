import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ProductVisual } from "@/components/listings/product-visual";
import { Container } from "@/components/ui/container";
import { getCategoryBySlug } from "@/data/categories";
import { getApprovedListingProducts } from "@/lib/listings";
import { siteName, siteUrl } from "@/lib/seo";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      url: `${siteUrl}/kategori/${category.slug}`,
      siteName,
      locale: "tr_TR",
      type: "website"
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const marketplaceProducts = await getApprovedListingProducts({ fallback: true });
  const categoryProducts = marketplaceProducts.filter((product) => product.category === category.title);
  const visibleProducts = categoryProducts.length > 0 ? categoryProducts : marketplaceProducts;

  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-14 md:py-20">
          <Link href="/kategoriler" className="mb-5 inline-flex text-sm font-black text-red-200 transition hover:text-brand-white">
            Kategoriler
          </Link>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            {category.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">{category.description}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {category.subcategories.map((subcategory) => (
              <Link
                key={subcategory.slug}
                href={`/kategori/${category.slug}?alt=${subcategory.slug}`}
                className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-neutral-200 transition hover:border-brand-red/70 hover:bg-brand-red/10 hover:text-brand-white"
              >
                {subcategory.title}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          <div className="market-card mb-6 flex min-w-0 flex-col gap-3 overflow-hidden p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-wrap gap-2">
              {["En popüler", "Yeni eklenen", "Ücretsiz", "Premium"].map((filter) => (
                <button key={filter} className="rounded-full bg-neutral-100 px-3.5 py-2 text-sm font-black text-neutral-700 ring-1 ring-neutral-200 transition hover:bg-red-50 hover:text-brand-red hover:ring-red-100">
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 md:w-72">
              <svg viewBox="0 0 24 24" width="16" height="16" className="block h-4 w-4 max-h-4 max-w-4 shrink-0 overflow-hidden text-neutral-500" fill="none" aria-hidden="true">
                <path d="m20 20-4.2-4.2M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input className="min-w-0 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-500" placeholder={`${category.title} içinde ara`} />
            </div>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-3">
            {visibleProducts.map((product, index) => (
              <Fragment key={product.id}>
                <article className="market-card relative flex min-h-[500px] min-w-0 flex-col overflow-hidden">
                  <Link href={`/urun/${product.slug}`} className="absolute inset-0 z-0" aria-label={`${product.title} ilanini ac`} />
                  <FavoriteButton listingId={product.id} />
                  <div className="pointer-events-none">
                    <ProductVisual accent={product.images[0]} title={product.title} thumbnailUrl={product.thumbnailUrl} variant="window" />
                  </div>
                  <div className="pointer-events-none relative z-10 flex flex-1 flex-col p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase text-brand-red">{product.category}</p>
                        <h2 className="mt-1 text-xl font-black leading-7 text-brand-black">{product.title}</h2>
                      </div>
                      <span className="rounded-full bg-neutral-950 px-3.5 py-2 text-sm font-black text-brand-white">
                        {product.price}
                      </span>
                    </div>
                    <span className="mb-4 w-fit rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-700 ring-1 ring-neutral-200">
                      {product.techStack[0]}
                    </span>
                    <p className="text-sm leading-6 text-neutral-600">{product.shortDescription}</p>
                    <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-5">
                      <span className="text-sm font-bold text-neutral-600">@{product.seller.username}</span>
                      <Link href={`/urun/${product.slug}`} className="pointer-events-auto rounded-full px-3 py-1.5 text-sm font-black text-brand-red transition hover:bg-red-50">
                        İncele
                      </Link>
                    </div>
                  </div>
                </article>
                {index === 1 ? (
                  <article className="market-card min-w-0 overflow-hidden bg-[#141416] text-brand-white lg:col-span-3">
                    <div className="grid gap-6 p-6 md:grid-cols-[1fr_280px] md:items-center">
                      <div>
                        <p className="text-xs font-black uppercase text-red-200">Sponsorlu ürün</p>
                        <h2 className="mt-2 text-2xl font-black leading-8 text-brand-white">Kategori vitrininde öne çık</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
                          Ürününü ilgili kategori akışında doğal bir kart deneyimiyle göster. Marketplace görünümüne uyumlu native alan.
                        </p>
                      </div>
                      <Link href="/" className="btn-primary w-full md:w-auto">
                        Sponsor alanı
                      </Link>
                    </div>
                  </article>
                ) : null}
              </Fragment>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
