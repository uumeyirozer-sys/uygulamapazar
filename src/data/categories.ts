import { slugifyTr } from "@/lib/slugify-tr";

export type Category = {
  title: string;
  slug: string;
  description: string;
  subcategories: Array<{
    title: string;
    slug: string;
  }>;
  seoTitle: string;
  seoDescription: string;
  icon: "app" | "game" | "code" | "wp" | "ai" | "design";
  tone: string;
  count: string;
  isDark: boolean;
};

const categorySource = [
  {
    title: "Uygulamalar",
    description: "Mobil ve web uygulamaları, hazır SaaS ürünleri ve yayınlanabilir uygulama kaynak kodları.",
    subcategories: [
      "Kitaplar",
      "İşletme",
      "Sohbet",
      "Flört",
      "Sağlık ve Fitness",
      "Konum Bazlı",
      "Müzik",
      "Haberler ve Dergiler",
      "Fotoğrafçılık",
      "Satış Noktası",
      "Alışveriş",
      "Sosyal Ağlar",
      "Spor",
      "Kamu Hizmetleri",
      "Video",
      "Duvar Kağıdı",
      "Eğitim",
      "Finans",
      "Yemek Sipariş",
      "Rezervasyon",
      "Emlak",
      "Taksi / Kurye",
      "CRM",
      "ERP",
      "Yapay Zeka",
      "Productivity",
      "Not Alma",
      "Ajanda / Takvim",
      "VPN",
      "Güvenlik",
      "Dosya Paylaşımı",
      "Hava Durumu",
      "Seyahat",
      "Etkinlik",
      "Kripto / Blockchain",
      "Canlı Yayın"
    ],
    icon: "app",
    tone: "bg-neutral-950 text-brand-white",
    count: "1.240 ürün"
  },
  {
    title: "Oyunlar",
    description: "Mobil, web ve masaüstü oyun projeleri; yayınlanabilir kaynak kodları ve oyun kitleri.",
    subcategories: [
      "Aksiyon",
      "Macera",
      "Oyun Salonları",
      "Kart",
      "Gündelik",
      "Aile",
      "Bulmaca",
      "Yarışma",
      "Spor",
      "Bilgi Yarışması ve Test",
      "RPG",
      "Strateji",
      "Simülasyon",
      "Korku",
      "FPS",
      "Survival",
      "Idle / Clicker",
      "Battle Royale",
      "Multiplayer",
      "Çocuk Oyunları"
    ],
    icon: "game",
    tone: "bg-brand-red text-brand-white",
    count: "860 ürün"
  },
  {
    title: "Web Scriptleri",
    description: "E-ticaret, panel, CRM, SaaS ve ilan sitesi gibi hazır web scriptleri.",
    subcategories: [
      "E-Ticaret",
      "Admin Panel",
      "CRM",
      "Forum",
      "Blog",
      "Haber Scripti",
      "SaaS Script",
      "Landing Page",
      "Firma Rehberi",
      "İlan Scripti",
      "AI Araçları"
    ],
    icon: "code",
    tone: "bg-neutral-900 text-brand-white",
    count: "940 ürün"
  },
  {
    title: "WordPress",
    description: "Tema, eklenti ve WooCommerce odaklı hazır WordPress ürünleri.",
    subcategories: ["Tema", "Eklenti", "WooCommerce"],
    icon: "wp",
    tone: "bg-brand-white text-brand-black",
    count: "520 ürün"
  },
  {
    title: "Yapay Zeka Araçları",
    description: "Chatbot, görsel üretim, içerik üretimi, otomasyon ve AI SaaS projeleri.",
    subcategories: ["Chatbot", "Görsel Üretim", "İçerik Üretim", "Otomasyon", "AI SaaS"],
    icon: "ai",
    tone: "bg-neutral-100 text-brand-black",
    count: "310 ürün"
  },
  {
    title: "UI Kit / Tasarım",
    description: "Figma kitleri, dashboard arayüzleri, mobil UI setleri ve admin template tasarımları.",
    subcategories: ["Figma", "Mobile UI", "Dashboard UI", "Web UI Kit", "Admin Template"],
    icon: "design",
    tone: "bg-neutral-950 text-brand-white",
    count: "455 ürün"
  }
] as const;

export const categories: Category[] = categorySource.map((category) => ({
  ...category,
  slug: slugifyTr(category.title),
  seoTitle: `${category.title} Ürünleri | UygulamaPazar.com`,
  seoDescription: `${category.description} UygulamaPazar.com üzerinde premium marketplace deneyimiyle keşfet.`,
  isDark: category.tone.includes("text-brand-white"),
  subcategories: category.subcategories.map((subcategory) => ({
    title: subcategory,
    slug: slugifyTr(subcategory)
  }))
}));

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
