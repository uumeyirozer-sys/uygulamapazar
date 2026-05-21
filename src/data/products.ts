import { slugifyTr } from "@/lib/slugify-tr";

export type Product = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string;
  tags: string[];
  techStack: string[];
  images: string[];
  thumbnailUrl?: string | null;
  price: string;
  seller: {
    id?: string;
    username: string;
    displayName: string;
    products: number;
    trustScore: string;
    avatarInitials: string;
    avatarUrl?: string | null;
  };
  views: string;
  createdAt: string;
  youtubeUrl: string;
  demoUrl: string;
  featured: boolean;
  sponsored: boolean;
};

const productSource = [
  {
    id: "prd_001",
    title: "TaskFlow Pro SaaS",
    shortDescription: "Takım yönetimi, görev panoları ve abonelik ekranları hazır premium SaaS paketi.",
    fullDescription:
      "TaskFlow Pro SaaS; görev yönetimi, ekip alanları, proje panoları, abonelik ekranları ve yönetici dashboard'u ile satışa hazır bir SaaS başlangıç ürünüdür. Ürün; modern onboarding, rol bazlı ekran akışı, ödeme planları ve responsive arayüzleriyle kısa sürede canlıya alınabilecek şekilde tasarlanmıştır. Kod yapısı modülerdir ve ürünleştirme, white-label kullanım veya niş pazarlara uyarlama için uygundur.",
    category: "Uygulamalar",
    subcategory: "Productivity",
    tags: ["SaaS", "Dashboard", "Subscription", "B2B"],
    techStack: ["Next.js", "React", "TypeScript", "Stripe", "Tailwind CSS"],
    images: ["from-red-600 via-neutral-950 to-neutral-800", "from-neutral-950 via-red-800 to-neutral-700", "from-neutral-800 via-neutral-950 to-red-700"],
    price: "$349",
    seller: {
      username: "studioalp",
      displayName: "Studio Alp",
      products: 38,
      trustScore: "98%",
      avatarInitials: "SA"
    },
    views: "2.4k",
    createdAt: "2026-04-18",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    demoUrl: "https://demo.uygulamapazar.com/taskflow-pro",
    featured: true,
    sponsored: false
  },
  {
    id: "prd_002",
    title: "Pixel Runner Mobile",
    shortDescription: "Mobil yayın için hazırlanmış sonsuz koşu oyunu, mağaza ve reklam alanları dahil.",
    fullDescription:
      "Pixel Runner Mobile; sonsuz koşu mekaniği, karakter mağazası, seviye dengesi, günlük ödül akışı ve reklam yerleşimleriyle mobil mağazalara hazırlanmış bir oyun kitidir. Kod ve sahne yapısı reklam, skin ve görev sistemlerini hızlıca özelleştirmek için düzenlenmiştir.",
    category: "Oyunlar",
    subcategory: "Idle / Clicker",
    tags: ["Mobile Game", "Runner", "Ads", "Casual"],
    techStack: ["Unity", "C#", "AdMob"],
    images: ["from-neutral-950 via-red-800 to-neutral-700", "from-red-700 via-neutral-900 to-neutral-700", "from-neutral-900 via-red-900 to-neutral-800"],
    price: "$199",
    seller: {
      username: "gameforge",
      displayName: "GameForge",
      products: 24,
      trustScore: "96%",
      avatarInitials: "GF"
    },
    views: "1.8k",
    createdAt: "2026-04-05",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    demoUrl: "https://demo.uygulamapazar.com/pixel-runner",
    featured: true,
    sponsored: true
  },
  {
    id: "prd_003",
    title: "AI Resume Builder",
    shortDescription: "CV oluşturma, kapak mektubu ve şablon yönetimi olan modern AI aracı.",
    fullDescription:
      "AI Resume Builder, kullanıcıların CV, kapak mektubu ve profil özetlerini yapay zeka destekli şekilde üretmesini sağlayan modern bir web uygulamasıdır. Şablon yönetimi, export ekranları, prompt akışları ve üyelik odaklı ürün mimarisiyle AI SaaS projeleri için güçlü bir başlangıç sunar.",
    category: "Yapay Zeka Araçları",
    subcategory: "İçerik Üretim",
    tags: ["AI", "Resume", "SaaS", "Templates"],
    techStack: ["React", "OpenAI", "Node.js", "Tailwind CSS"],
    images: ["from-neutral-800 via-neutral-950 to-red-700", "from-red-600 via-neutral-950 to-neutral-800", "from-neutral-950 via-neutral-800 to-red-700"],
    price: "$279",
    seller: {
      username: "kodlab",
      displayName: "KodLab",
      products: 51,
      trustScore: "99%",
      avatarInitials: "KL"
    },
    views: "3.1k",
    createdAt: "2026-03-28",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    demoUrl: "https://demo.uygulamapazar.com/ai-resume-builder",
    featured: true,
    sponsored: false
  }
] as const;

export const products: Product[] = productSource.map((product) => ({
  ...product,
  slug: slugifyTr(product.title),
  tags: [...product.tags],
  techStack: [...product.techStack],
  images: [...product.images]
}));

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product): Product[] {
  return products.filter((relatedProduct) => relatedProduct.id !== product.id).slice(0, 3);
}
