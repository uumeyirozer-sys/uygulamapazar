import Link from "next/link";
import { CategoryIcon } from "@/components/categories/category-icon";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ProductVisual } from "@/components/listings/product-visual";
import { Container } from "@/components/ui/container";
import { categories } from "@/data/categories";
import { getHomepageProfileCards, getHomepageSponsoredProduct, type HomepageProfileCard } from "@/lib/homepage-management";
import { getApprovedListingProducts } from "@/lib/listings";

const fallbackProfiles = [
  { name: "Studio Alp", handle: "@studioalp", products: "38 ürün", initials: "SA", score: "98%", username: "studioalp" },
  { name: "GameForge", handle: "@gameforge", products: "24 ürün", initials: "GF", score: "96%", username: "gameforge" },
  { name: "KodLab", handle: "@kodlab", products: "51 ürün", initials: "KL", score: "99%", username: "kodlab" },
  { name: "Kod Ustası", handle: "@kodustasi", products: "42 ürün", initials: "KU", score: "97%", username: "kodustasi" }
];

const popularSearches = ["AI script", "mobil oyun", "SaaS", "WordPress tema"];

export const dynamic = "force-dynamic";

function getHomeCategoryTheme(category: (typeof categories)[number]) {
  const isRed = category.tone.includes("bg-brand-red");
  const isDark = !isRed && (category.tone.includes("bg-neutral-950") || category.tone.includes("bg-neutral-900"));

  if (isRed) {
    return {
      cardBg: "bg-brand-red",
      titleText: "text-brand-white",
      bodyText: "text-white/90",
      iconClass: "border-white/20 bg-white/10 text-brand-white",
      glowClass: "bg-white/15",
      chipClass: "border-white/20 bg-white/10 text-brand-white"
    };
  }

  if (isDark) {
    return {
      cardBg: "bg-neutral-950",
      titleText: "text-brand-white",
      bodyText: "text-neutral-200",
      iconClass: "border-white/15 bg-white/10 text-brand-white",
      glowClass: "bg-white/10",
      chipClass: "border-white/20 bg-white/10 text-neutral-100"
    };
  }

  return {
    cardBg: "bg-brand-white",
    titleText: "text-brand-black",
    bodyText: "text-neutral-700",
    iconClass: "border-neutral-200 bg-neutral-100 text-brand-black",
    glowClass: "bg-brand-red/10",
    chipClass: "border-neutral-200 bg-neutral-100 text-neutral-800"
  };
}

export default async function Home() {
  const [marketplaceProducts, managedProfiles, sponsoredProduct] = await Promise.all([
    getApprovedListingProducts({ fallback: true, limit: 6 }),
    getHomepageProfileCards(),
    getHomepageSponsoredProduct()
  ]);
  const homepageProfiles: HomepageProfileCard[] = managedProfiles.length > 0 ? managedProfiles : (fallbackProfiles as HomepageProfileCard[]);
  const trendingProducts = marketplaceProducts.slice(0, 3);
  const newProducts = marketplaceProducts.slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(229,9,20,0.22),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-950/40 to-transparent" />
        <Container className="relative grid gap-10 py-14 md:grid-cols-[1.08fr_0.92fr] md:items-center md:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
              Dijital ürün marketplace
            </p>
            <h1 className="text-4xl font-black leading-[1.04] text-brand-white sm:text-5xl lg:text-6xl">
              Satın almaya hazır uygulama, oyun ve scriptleri keşfet.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-300 sm:text-lg">
              UygulamaPazar.com, geliştiricilerin satışa hazır dijital ürünlerini modern, seçilmiş ve
              güven veren bir vitrin deneyimiyle öne çıkarır.
            </p>

            <form action="/arama" className="mt-8 rounded-xl border border-white/12 bg-white/95 p-2.5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex min-h-14 flex-1 items-center gap-3 rounded-lg bg-neutral-50 px-4 ring-1 ring-neutral-200 transition focus-within:bg-brand-white focus-within:ring-brand-red/45">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-neutral-500" fill="none" aria-hidden="true">
                    <path d="m20 20-4.2-4.2M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    aria-label="Marketplace arama"
                    name="q"
                    className="min-h-14 w-full bg-transparent text-sm font-semibold text-brand-black outline-none placeholder:text-neutral-500"
                    placeholder="Uygulama, oyun, script veya teknoloji ara"
                  />
                </div>
                <button type="submit" className="btn-primary min-h-14 px-8 shadow-[0_14px_28px_rgba(229,9,20,0.24)]">Ara</button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {popularSearches.map((item) => (
                <Link
                  href={`/arama?q=${encodeURIComponent(item)}`}
                  key={item}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-neutral-200 transition duration-200 ease-premium hover:border-brand-red/70 hover:bg-brand-red/10 hover:text-brand-white"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-brand-red/15 blur-3xl" />
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="grid gap-3">
                {trendingProducts.slice(0, 2).map((product, index) => (
                  <article
                    key={product.id}
                    className={`relative overflow-hidden rounded-xl bg-brand-white text-brand-black shadow-card ${index === 1 ? "md:ml-8" : ""}`}
                  >
                    <FavoriteButton listingId={product.id} />
                    <ProductVisual accent={product.images[0]} title={product.title} thumbnailUrl={product.thumbnailUrl} variant="cover" />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-base font-black leading-6">{product.title}</h2>
                          <p className="mt-1 text-sm font-semibold text-neutral-500">{product.category}</p>
                        </div>
                        <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-black text-brand-white">
                          {product.price}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="app-section bg-brand-white">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="tag-text text-brand-red">Kategoriler</p>
              <h2 className="section-title mt-2">Popüler kategoriler</h2>
            </div>
            <Link href="/kategoriler" className="hidden text-sm font-black text-brand-red transition hover:text-brand-red-hover sm:inline-flex">
              Tümünü gör
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const theme = getHomeCategoryTheme(category);

              return (
              <Link
                href={`/kategori/${category.slug}`}
                key={category.slug}
                className={`group relative flex h-40 min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-neutral-200/90 p-5 shadow-card transition duration-200 ease-premium hover:-translate-y-1 hover:border-neutral-300 hover:shadow-card-hover ${theme.cardBg} ${theme.titleText}`}
              >
                <div className={`pointer-events-none absolute right-3 top-3 h-16 w-16 max-w-16 rounded-full blur-xl transition duration-300 group-hover:scale-110 ${theme.glowClass}`} />
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 max-h-12 max-w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-inner ${theme.iconClass}`}>
                    <CategoryIcon type={category.icon} />
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${theme.chipClass}`}>
                    Popüler
                  </span>
                </div>
                <div>
                  <h3 className={`text-xl font-black leading-7 ${theme.titleText}`}>
                    {category.title}
                  </h3>
                  <p className={`mt-1 text-sm font-bold ${theme.bodyText}`}>
                    {category.count}
                  </p>
                </div>
              </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="trend" className="app-section bg-neutral-50">
        <Container>
          <div className="mb-8">
            <p className="tag-text text-brand-red">Trend</p>
            <h2 className="section-title mt-2">Trend ürünler</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {trendingProducts.map((product) => (
              <article key={product.id} className="market-card group relative flex h-full min-h-[540px] flex-col overflow-hidden">
                <Link href={`/urun/${product.slug}`} className="absolute inset-0 z-0" aria-label={`${product.title} ilanini ac`} />
                <FavoriteButton listingId={product.id} />
                <div className="pointer-events-none">
                  <ProductVisual accent={product.images[0]} title={product.title} thumbnailUrl={product.thumbnailUrl} variant="cover" />
                </div>
                <div className="pointer-events-none relative z-10 flex flex-1 flex-col p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase text-brand-red">{product.category}</p>
                      <h3 className="mt-1 text-xl font-black leading-7 text-brand-black">{product.title}</h3>
                    </div>
                    <span className="rounded-full bg-neutral-950 px-3.5 py-2 text-sm font-black text-brand-white shadow-[0_10px_22px_rgba(9,9,11,0.16)]">
                      {product.price}
                    </span>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {product.techStack.slice(0, 3).map((tech) => (
                      <span key={tech} className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-700 ring-1 ring-neutral-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-neutral-600">{product.shortDescription}</p>
                  <div className="mt-5 rounded-lg bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-500 ring-1 ring-neutral-100">
                    {product.createdAt ? `Eklenme: ${product.createdAt.slice(0, 10)}` : "Yeni ilan"}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-5">
                    <span className="text-sm font-bold text-neutral-600">@{product.seller.username}</span>
                    <Link href={`/urun/${product.slug}`} className="pointer-events-auto rounded-full px-3 py-1.5 text-sm font-black text-brand-red transition hover:bg-red-50">
                      İncele
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section id="yeni-eklenenler" className="app-section bg-brand-white">
        <Container className="grid gap-7 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-8">
              <p className="tag-text text-brand-red">Yeni</p>
              <h2 className="section-title mt-2">Yeni eklenenler</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {newProducts.map((product) => (
                <article key={product.id} className="market-card relative min-h-36 overflow-hidden">
                  <FavoriteButton listingId={product.id} />
                  <Link href={`/urun/${product.slug}`} className="grid min-h-36 grid-cols-[96px_1fr]">
                    <div className="overflow-hidden bg-[#141416]">
                      <ProductVisual accent={product.images[0]} title={product.title} thumbnailUrl={product.thumbnailUrl} compact variant="cover" />
                    </div>
                    <div className="min-w-0 flex flex-col justify-between p-4">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase text-brand-red">{product.category}</p>
                        <h3 className="mt-1 break-words text-base font-black leading-6 text-brand-black">{product.title}</h3>
                      </div>
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <span className="min-w-0 truncate rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-600">{product.techStack[0]}</span>
                        <span className="shrink-0 text-sm font-black text-brand-black">{product.price}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <aside className="market-card flex min-h-[390px] flex-col justify-between overflow-hidden bg-[#141416] p-6 text-brand-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-red-200">Sponsorlu</p>
                <h2 className="mt-3 text-2xl font-black leading-8 text-brand-white">{sponsoredProduct.title}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-300">{sponsoredProduct.shortDescription}</p>
                <p className="hidden">
                  Ürün sayfası, ödeme akışı ve tanıtım bölümleri hazır premium SaaS başlangıç paketi.
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-neutral-300">
                Native
              </span>
            </div>
            <div className="mt-8 overflow-hidden rounded-xl border border-white/10 shadow-[0_20px_55px_rgba(0,0,0,0.24)]">
              <ProductVisual accent={sponsoredProduct.images[0]} title={sponsoredProduct.title} thumbnailUrl={sponsoredProduct.thumbnailUrl} variant="cover" />
            </div>
            <Link href={`/urun/${sponsoredProduct.slug}`} className="btn-primary mt-5 w-full shadow-[0_12px_28px_rgba(229,9,20,0.2)]">
              Sponsor ürünü gör
            </Link>
          </aside>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          <div className="mb-8">
            <p className="tag-text text-brand-red">Topluluk</p>
            <h2 className="section-title mt-2">Popüler profiller</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homepageProfiles.map((profile) => (
              <Link key={profile.handle} href={`/profil/${profile.username}`} className="market-card group block h-64 overflow-hidden p-5 text-center">
                <div className="mx-auto mb-4 h-16 w-full rounded-xl bg-gradient-to-br from-neutral-950 via-neutral-800 to-brand-red opacity-95" />
                <div className="mx-auto -mt-12 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-950 text-xl font-black text-brand-white ring-4 ring-brand-white transition duration-200 group-hover:scale-[1.03]">
                  {"avatarUrl" in profile && profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    profile.initials
                  )}
                </div>
                <h3 className="mt-4 text-lg font-black leading-6 text-brand-black">{profile.name}</h3>
                <p className="mt-1 text-sm font-bold text-neutral-500">{profile.handle}</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-brand-red">{profile.products}</span>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-600">{profile.score}</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
