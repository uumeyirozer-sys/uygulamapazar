import type { Metadata } from "next";
import { InfoPage } from "@/components/info/info-page";

export const metadata: Metadata = {
  title: "Kullanım Şartları | UygulamaPazar.com",
  description: "UygulamaPazar.com kullanım şartları."
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Kullanım Şartları"
      title="Platform kullanımına ilişkin temel şartlar."
      description="Bu sayfa UygulamaPazar.com kullanımına dair temel bilgilendirme metnidir."
      sections={[
        {
          title: "İlan ve İletişim Aracı",
          content: [
            "UygulamaPazar yalnızca ilan yayınlama, ürün keşfi ve kullanıcılar arasında iletişim kurulmasına aracılık eden bir platformdur.",
            "Platform, alıcı ve satıcıların kendi aralarında görüşmesini kolaylaştırır."
          ]
        },
        {
          title: "Sorumluluk Sınırı",
          content: [
            "UygulamaPazar ödeme, dosya teslimi, lisans, garanti veya satış sonrası destekten sorumlu değildir.",
            "Kullanıcılar kendi aralarındaki ticaret, ödeme, teslimat ve destek süreçlerinden kendileri sorumludur."
          ]
        },
        {
          title: "Yasaklı İçerikler",
          content: [
            "Yasaklı, yanıltıcı, telif hakkı ihlali içeren, zararlı yazılım barındıran veya dolandırıcılık amacı taşıyan içerikler yayınlanamaz.",
            "Admin ekibi, platform kurallarına aykırı ilanları yayından kaldırabilir veya reddedebilir."
          ]
        }
      ]}
    />
  );
}
