import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ProductVisual } from "@/components/listings/product-visual";
import { MessageModalButton } from "@/components/profile/message-modal-button";
import { Container } from "@/components/ui/container";
import { getApprovedListingProductBySlug, getRelatedApprovedListingProducts } from "@/lib/listings";
import { siteName, siteUrl } from "@/lib/seo";
import { slugifyTr } from "@/lib/slugify-tr";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getApprovedListingProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.title} | UygulamaPazar.com`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.title} | UygulamaPazar.com`,
      description: product.shortDescription,
      url: `${siteUrl}/urun/${product.slug}`,
      siteName,
      locale: "tr_TR",
      type: "website"
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getApprovedListingProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedApprovedListingProducts(product);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(product.youtubeUrl);

  return (
    <>
      <section className="border-b border-neutral-200 bg-neutral-50">
        <Container className="py-8 md:py-12">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-neutral-500">
            <Link href="/kategoriler" className="transition hover:text-brand-red">
              Kategoriler
            </Link>
            <span>/</span>
            <Link href={`/kategori/${slugifyTr(product.category)}`} className="transition hover:text-brand-red">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-brand-black">{product.title}</span>
          </div>

          <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="min-w-0">
              <div className="market-card overflow-hidden">
                <ProductVisual accent={product.images[0]} title={product.title} thumbnailUrl={product.thumbnailUrl} variant="window" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {product.images.map((image, index) => (
                  <div key={`${image}-${index}`} className="market-card overflow-hidden ring-1 ring-transparent transition hover:ring-brand-red/30">
                    <ProductVisual accent={image} title={product.title} thumbnailUrl={index === 0 ? product.thumbnailUrl : null} compact variant="window" />
                  </div>
                ))}
              </div>
            </div>

            <aside className="market-card sticky top-24 overflow-hidden p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-lg font-black text-brand-white ring-4 ring-neutral-100">
                  {product.seller.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.seller.avatarUrl} alt={product.seller.displayName} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    product.seller.avatarInitials
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-black text-brand-black">{product.seller.displayName}</h2>
                  <Link href={`/profil/${product.seller.username}`} className="text-sm font-bold text-neutral-500 transition hover:text-brand-red">
                    @{product.seller.username}
                  </Link>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
                  <p className="text-xs font-black uppercase text-neutral-500">Ürün</p>
                  <p className="mt-1 text-lg font-black text-brand-black">{product.seller.products}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3 ring-1 ring-red-100">
                  <p className="text-xs font-black uppercase text-brand-red">Güven</p>
                  <p className="mt-1 text-lg font-black text-brand-black">{product.seller.trustScore}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                <MessageModalButton userId={product.seller.id} listingId={product.id} className="btn-primary w-full" />
                <Link href={`/profil/${product.seller.username}`} className="btn-outline w-full">
                  Profili Gör
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-brand-white">
        <Container className="grid min-w-0 gap-8 py-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="min-w-0">
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black uppercase text-brand-red ring-1 ring-red-100">
                {product.category}
              </span>
              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-black uppercase text-neutral-700 ring-1 ring-neutral-200">
                {product.subcategory}
              </span>
              {product.featured ? (
                <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-black uppercase text-brand-white">
                  Öne çıkan
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="max-w-3xl text-4xl font-black leading-[1.08] text-brand-black sm:text-5xl">
                  {product.title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-600">{product.shortDescription}</p>
              </div>
              <div className="shrink-0 rounded-2xl bg-neutral-950 px-5 py-4 text-center text-brand-white shadow-[0_18px_45px_rgba(9,9,11,0.18)]">
                <p className="text-xs font-black uppercase text-neutral-400">Fiyat</p>
                <p className="mt-1 text-2xl font-black">{product.price}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-neutral-600">
              <span className="rounded-full bg-neutral-100 px-3 py-1.5 ring-1 ring-neutral-200">{product.views} görüntülenme</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1.5 ring-1 ring-neutral-200">Eklenme: {product.createdAt}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.techStack.map((tech) => (
                <span key={tech} className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-700 ring-1 ring-neutral-200">
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-10 border-b border-neutral-200">
              <div className="flex gap-2 overflow-x-auto pb-3">
                {["Açıklama", "Özellikler", "Teknolojiler", "Medya"].map((tab, index) => (
                  <a
                    href={`#${tab.toLowerCase().replace("ı", "i").replace("ö", "o")}`}
                    key={tab}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                      index === 0 ? "bg-neutral-950 text-brand-white" : "bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-brand-red"
                    }`}
                  >
                    {tab}
                  </a>
                ))}
              </div>
            </div>

            <div id="açiklama" className="mt-8 grid gap-6">
              <article className="market-card p-6">
                <h2 className="text-2xl font-black text-brand-black">Ürün açıklaması</h2>
                <p className="mt-4 text-base leading-8 text-neutral-700">{product.fullDescription}</p>
              </article>

              <article className="market-card overflow-hidden bg-[#141416] p-6 text-brand-white">
                <p className="text-xs font-black uppercase text-red-200">Sponsorlu</p>
                <h2 className="mt-2 text-2xl font-black text-brand-white">Ürününü benzer alıcılara göster</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
                  Native reklam alanları, ürün detay akışına doğal şekilde yerleşir ve marketplace deneyimini bölmeden görünürlük sağlar.
                </p>
              </article>

              <article id="özellikler" className="market-card p-6">
                <h2 className="text-2xl font-black text-brand-black">Özellikler</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {["Responsive arayüz", "Satışa hazır ekran akışı", "Modüler dosya yapısı", "Kolay özelleştirilebilir tasarım"].map((feature) => (
                    <div key={feature} className="rounded-xl bg-neutral-50 p-4 text-sm font-bold text-neutral-700 ring-1 ring-neutral-100">
                      {feature}
                    </div>
                  ))}
                </div>
              </article>

              <article id="teknolojiler" className="market-card p-6">
                <h2 className="text-2xl font-black text-brand-black">Teknolojiler</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[...product.techStack, ...product.tags].map((item) => (
                    <span key={item} className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-700 ring-1 ring-neutral-200">
                      {item}
                    </span>
                  ))}
                </div>
              </article>

              <article id="medya" className="market-card overflow-hidden p-6">
                <h2 className="text-2xl font-black text-brand-black">Medya</h2>
                {product.youtubeUrl && youtubeEmbedUrl ? (
                  <div className="mt-5 overflow-hidden rounded-2xl bg-neutral-950">
                    <iframe
                      className="aspect-video w-full"
                      src={youtubeEmbedUrl}
                      title={`${product.title} ürün videosu`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : product.youtubeUrl ? (
                  <div className="mt-5 rounded-2xl bg-red-50 p-5 text-sm font-bold text-brand-red ring-1 ring-red-100">
                    Video bağlantısı geçersiz.
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-neutral-50 p-5 text-sm font-bold text-neutral-600 ring-1 ring-neutral-100">
                    Bu ilan için video bağlantısı eklenmemiş.
                  </div>
                )}
              </article>

              <article className="market-card p-6">
                <h2 className="text-2xl font-black text-brand-black">Demo / canlı önizleme</h2>
                <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-neutral-50 p-5 ring-1 ring-neutral-100 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-brand-black">Canlı demo ortamı</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-500">{product.demoUrl}</p>
                  </div>
                  {product.demoUrl ? (
                    <Link href={product.demoUrl} className="btn-primary" target="_blank">
                      Demoyu Aç
                    </Link>
                  ) : (
                    <span className="rounded-full bg-neutral-200 px-4 py-2 text-sm font-black text-neutral-600">
                      Demo yok
                    </span>
                  )}
                </div>
              </article>
            </div>
          </div>

          <aside className="hidden lg:block" />
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          <div className="mb-8">
            <p className="tag-text text-brand-red">Benzer</p>
            <h2 className="section-title mt-2">Benzer ürünler</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((relatedProduct) => (
              <article key={relatedProduct.id} className="market-card relative min-w-0 overflow-hidden">
                <FavoriteButton listingId={relatedProduct.id} />
                <Link href={`/urun/${relatedProduct.slug}`} className="block">
                <ProductVisual accent={relatedProduct.images[0]} title={relatedProduct.title} thumbnailUrl={relatedProduct.thumbnailUrl} compact />
                <div className="p-5">
                  <p className="text-xs font-black uppercase text-brand-red">{relatedProduct.category}</p>
                  <h3 className="mt-1 text-xl font-black leading-7 text-brand-black">{relatedProduct.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{relatedProduct.shortDescription}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-black text-brand-black">{relatedProduct.price}</span>
                    <span className="text-sm font-black text-brand-red">İncele</span>
                  </div>
                </div>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
