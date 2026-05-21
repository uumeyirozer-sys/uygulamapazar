import type { Product } from "@/data/products";
import { products } from "@/data/products";

export type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  socialLinks: Array<{
    label: string;
    href: string;
  }>;
  joinedAt: string;
  productCount: number;
  totalViews: string;
  trustScore: string;
  products: Product[];
};

function productsBySeller(username: string) {
  return products.filter((product) => product.seller.username === username);
}

const kodlabProducts = productsBySeller("kodlab");

export const users: UserProfile[] = [
  {
    id: "usr_001",
    username: "studioalp",
    displayName: "Studio Alp",
    avatar: "SA",
    bio: "B2B SaaS, dashboard ve abonelik odaklı dijital ürünler geliştiren bağımsız ürün stüdyosu.",
    socialLinks: [
      { label: "Website", href: "https://studioalp.dev" },
      { label: "GitHub", href: "https://github.com/studioalp" }
    ],
    joinedAt: "2025-11-12",
    productCount: 38,
    totalViews: "18.6k",
    trustScore: "98%",
    products: productsBySeller("studioalp")
  },
  {
    id: "usr_002",
    username: "gameforge",
    displayName: "GameForge",
    avatar: "GF",
    bio: "Mobil oyun kitleri, Unity kaynak kodları ve yayınlanabilir casual oyun projeleri üretir.",
    socialLinks: [
      { label: "Portfolio", href: "https://gameforge.example.com" },
      { label: "YouTube", href: "https://youtube.com/@gameforge" }
    ],
    joinedAt: "2025-09-04",
    productCount: 24,
    totalViews: "12.9k",
    trustScore: "96%",
    products: productsBySeller("gameforge")
  },
  {
    id: "usr_003",
    username: "kodlab",
    displayName: "KodLab",
    avatar: "KL",
    bio: "AI araçları, React tabanlı SaaS ürünleri ve modern web uygulama şablonları geliştirir.",
    socialLinks: [
      { label: "Website", href: "https://kodlab.dev" },
      { label: "GitHub", href: "https://github.com/kodlab" }
    ],
    joinedAt: "2025-07-21",
    productCount: 51,
    totalViews: "27.4k",
    trustScore: "99%",
    products: kodlabProducts
  },
  {
    id: "usr_004",
    username: "kodustasi",
    displayName: "Kod Ustası",
    avatar: "KU",
    bio: "Flutter, Laravel ve yapay zeka destekli ürün fikirlerini hızlıca satışa hazır dijital ürünlere dönüştürür.",
    socialLinks: [
      { label: "Website", href: "https://kodustasi.dev" },
      { label: "LinkedIn", href: "https://linkedin.com/in/kodustasi" }
    ],
    joinedAt: "2025-05-10",
    productCount: 42,
    totalViews: "31.2k",
    trustScore: "97%",
    products: kodlabProducts.length > 0 ? kodlabProducts : products.slice(0, 2)
  }
];

export function getUserByUsername(username: string): UserProfile | undefined {
  return users.find((user) => user.username === username);
}
