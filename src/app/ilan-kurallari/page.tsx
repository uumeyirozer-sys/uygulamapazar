import type { Metadata } from "next";
import { InfoPage } from "@/components/info/info-page";

export const metadata: Metadata = {
  title: "İlan Kuralları | UygulamaPazar.com",
  description: "UygulamaPazar.com ilan yayınlama kuralları."
};

export default function ListingRulesPage() {
  return (
    <InfoPage
      eyebrow="İlan Kuralları"
      title="Kaliteli ve güvenilir ilanlar için yayın kuralları."
      description="UygulamaPazar.com’da yayınlanan ilanların açık, doğru ve kullanıcıları yanıltmayacak şekilde hazırlanması gerekir."
      sections={[
        {
          title: "Yasaklı İlanlar",
          content: [
            "Yanıltıcı ilan, sahte uygulama, dolandırıcılık amacı taşıyan ürün, zararlı yazılım ve telif hakkı ihlali içeren içerikler yasaktır.",
            "Kullanıcıların sahip olmadığı veya yayınlama hakkı bulunmayan ürünler platformda listelenemez."
          ]
        },
        {
          title: "İlan Kalitesi",
          content: [
            "Her ilan açıklayıcı başlık, net açıklama, kaliteli görsel ve en az 5 anahtar kelime içermelidir.",
            "Ürün ne işe yarar, hangi teknolojilerle geliştirilmiştir ve alıcıya ne teslim edilir gibi bilgiler açıkça belirtilmelidir."
          ]
        },
        {
          title: "Admin Onayı",
          content: [
            "İlanlar admin onayından sonra yayına alınır. Admin ekibi eksik, yanıltıcı veya kurallara aykırı ilanları reddedebilir.",
            "UygulamaPazar dosya yükleme, dosya barındırma veya dosya teslimi yapmaz; kullanıcıları ilan ve mesajlaşma üzerinden buluşturur."
          ]
        }
      ]}
    />
  );
}
