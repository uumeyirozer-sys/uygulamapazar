import type { Metadata } from "next";

export const siteUrl = "https://uygulamapazar.com";
export const siteName = "UygulamaPazar";
export const siteDescription = "Türkiye’de uygulama, oyun, script ve dijital ürün ilanlarını keşfetme platformu.";

export const noIndexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false
  }
};
