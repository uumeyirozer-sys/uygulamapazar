import type { Metadata } from "next";
import Link from "next/link";
import { CategoryIcon } from "@/components/categories/category-icon";
import { Container } from "@/components/ui/container";
import { categories } from "@/data/categories";

type CategoryItem = (typeof categories)[number];

function getCategoryCardTheme(category: CategoryItem) {
  const isRed = category.tone.includes("bg-brand-red");
  const isDark = !isRed && (category.tone.includes("bg-neutral-950") || category.tone.includes("bg-neutral-900"));

  if (isRed) {
    return {
      cardBg: "bg-brand-red",
      titleText: "text-brand-white",
      bodyText: "text-white/90",
      metaText: "text-white/85",
      iconClass: "border-white/20 bg-white/10 text-brand-white",
      glowClass: "bg-white/15",
      chipClass: "border-white/20 bg-white/10 text-brand-white",
      subChipClass:
        "pointer-events-auto rounded-full bg-brand-white px-3 py-1.5 text-xs font-bold text-brand-black ring-1 ring-white/40 transition hover:bg-neutral-100 hover:text-brand-red",
      buttonClass:
        "pointer-events-auto rounded-full bg-brand-white px-3 py-1.5 text-sm font-black text-brand-red transition hover:bg-neutral-100"
    };
  }

  if (isDark) {
    return {
      cardBg: "bg-neutral-950",
      titleText: "text-brand-white",
      bodyText: "text-neutral-200",
      metaText: "text-neutral-200",
      iconClass: "border-white/15 bg-white/10 text-brand-white",
      glowClass: "bg-white/10",
      chipClass: "border-white/20 bg-white/10 text-neutral-100",
      subChipClass:
        "pointer-events-auto rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-800 ring-1 ring-neutral-200 transition hover:bg-red-50 hover:text-brand-red hover:ring-red-100",
      buttonClass:
        "pointer-events-auto rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-black text-brand-black transition hover:bg-red-50 hover:text-brand-red"
    };
  }

  return {
    cardBg: "bg-brand-white",
    titleText: "text-brand-black",
    bodyText: "text-neutral-700",
    metaText: "text-neutral-700",
    iconClass: "border-neutral-200 bg-neutral-100 text-brand-black",
    glowClass: "bg-brand-red/10",
    chipClass: "border-neutral-200 bg-neutral-100 text-neutral-800",
    subChipClass:
      "pointer-events-auto rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-800 ring-1 ring-neutral-200 transition hover:bg-red-50 hover:text-brand-red hover:ring-red-100",
    buttonClass:
      "pointer-events-auto rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-black text-brand-black transition hover:bg-red-50 hover:text-brand-red"
  };
}

export const metadata: Metadata = {
  title: "Kategoriler | UygulamaPazar.com",
  description:
    "UygulamaPazar.com kategori agacini kesfedin: uygulamalar, oyunlar, web scriptleri, WordPress, yapay zeka araclari ve UI kitler."
};

export default function CategoriesPage() {
  const visibleCategories = categories.filter((category) => category.slug && category.title);

  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-14 md:py-20">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            Marketplace kategorileri
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            Satisa hazir dijital urunleri kategori bazli kesfet.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            Uygulamalar, oyunlar, scriptler, WordPress urunleri, yapay zeka araclari ve tasarim kitleri icin duzenli,
            hizli taranabilir marketplace yapisi.
          </p>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            {visibleCategories.map((category) => {
              const theme = getCategoryCardTheme(category);

              return (
                <article key={category.slug} className="market-card relative min-w-0 overflow-hidden bg-brand-white text-brand-black">
                  <Link href={`/kategori/${category.slug}`} className="absolute inset-0 z-0" aria-label={`${category.title} kategorisini ac`} />
                  <div className={`pointer-events-none relative overflow-hidden p-6 ${theme.cardBg} ${theme.titleText}`}>
                    <div className={`pointer-events-none absolute right-3 top-3 h-16 w-16 max-w-16 rounded-full blur-xl ${theme.glowClass}`} />
                    <div className="relative flex items-start justify-between gap-4">
                      <div className={`flex h-12 w-12 max-h-12 max-w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-inner ${theme.iconClass}`}>
                        <CategoryIcon type={category.icon} />
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${theme.chipClass}`}>
                        {category.count}
                      </span>
                    </div>
                    <div className="relative mt-8">
                      <h2 className={`text-2xl font-black leading-8 ${theme.titleText}`}>{category.title}</h2>
                      <p className={`mt-3 max-w-xl text-sm leading-6 ${theme.bodyText}`}>{category.description}</p>
                    </div>
                  </div>

                  <div className="pointer-events-none relative z-10 p-6">
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.slice(0, 12).map((subcategory) => (
                        <Link
                          key={subcategory.slug}
                          href={`/kategori/${category.slug}?alt=${subcategory.slug}`}
                          className={theme.subChipClass}
                        >
                          {subcategory.title}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-5">
                      <span className={`text-sm font-bold ${theme.metaText}`}>{category.subcategories.length} alt kategori</span>
                      <Link href={`/kategori/${category.slug}`} className={theme.buttonClass}>
                        Kategoriyi ac
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
