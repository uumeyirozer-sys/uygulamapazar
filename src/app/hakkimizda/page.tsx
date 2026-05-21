import type { Metadata } from "next";
import { InfoPage } from "@/components/info/info-page";

export const metadata: Metadata = {
  title: "Hakkımızda | UygulamaPazar.com",
  description: "UygulamaPazar.com hakkında: Türkçe dijital ürün keşif ve listeleme platformu."
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Hakkımızda"
      title="Türkçe dijital ürün keşif ve listeleme platformu."
      description="UygulamaPazar.com; uygulama, oyun, script, WordPress ürünü, yapay zeka aracı ve tasarım kitlerini keşfetmek için oluşturulmuş modern bir ilan/vitrin platformudur."
      sections={[
        {
          title: "Platform Konumu",
          content: [
            "UygulamaPazar, satıcıların dijital ürünlerini tanıtmasına ve alıcıların bu ürünleri keşfetmesine yardımcı olan bir marketplace vitrinidir.",
            "Platform, kullanıcıları site içi mesajlaşma ve ilan sayfaları üzerinden buluşturmayı amaçlar."
          ]
        },
        {
          title: "Aracılık Sınırları",
          content: [
            "UygulamaPazar dosya barındırmaz, ürün dosyası teslim etmez ve ödeme aracılığı yapmaz.",
            "Satış, lisans, teslimat ve destek süreçleri kullanıcıların kendi aralarındaki anlaşmaya göre yürütülür."
          ]
        },
        {
          title: "Vizyon",
          content: [
            "Türkçe dijital ürün ekosisteminde daha düzenli, güven veren ve keşfedilebilir bir vitrin deneyimi sunmayı hedefliyoruz.",
            "Premium kart yapısı, kategori sistemi ve profil sayfalarıyla ürünlerin profesyonel şekilde sunulmasını sağlıyoruz."
          ]
        }
      ]}
    />
  );
}
