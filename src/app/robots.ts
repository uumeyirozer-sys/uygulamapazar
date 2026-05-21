import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const privateRoutes = [
    "/admin",
    "/giris",
    "/kayit",
    "/mesajlar",
    "/favoriler",
    "/bildirimler",
    "/ilanlarim",
    "/profil-duzenle",
    "/ilan-ver"
  ];

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: privateRoutes
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
