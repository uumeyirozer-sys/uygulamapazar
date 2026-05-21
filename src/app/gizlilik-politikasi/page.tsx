import type { Metadata } from "next";
import { InfoPage } from "@/components/info/info-page";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | UygulamaPazar.com",
  description: "UygulamaPazar.com gizlilik politikası."
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Gizlilik Politikası"
      title="Veri kullanımı ve gizlilik bilgilendirmesi."
      description="UygulamaPazar.com kullanıcı deneyimini geliştirmek ve marketplace işleyişini sağlamak için bazı verileri işleyebilir."
      sections={[
        {
          title: "İşlenebilecek Veriler",
          content: [
            "Üyelik sistemi aktif olduğunda kullanıcı adı, e-posta, profil bilgileri, ilan verileri ve mesajlaşma verileri işlenebilir.",
            "İlan başlıkları, açıklamalar, kategori bilgileri, görsel önizleme alanları ve kullanıcı etkileşimleri platform deneyimi için kullanılabilir."
          ]
        },
        {
          title: "Mesajlaşma ve İlan Verileri",
          content: [
            "Site içi mesajlaşma, kullanıcıların ilanlar hakkında iletişim kurmasını sağlamak için kullanılabilir.",
            "UygulamaPazar ödeme veya dosya teslimi yapmadığı için bu süreçlere ilişkin finansal veya teslimat sorumluluğu üstlenmez."
          ]
        },
        {
          title: "Çerezler ve Reklam",
          content: [
            "Çerezler ve benzeri teknolojiler ileride oturum, tercih ve analiz amaçlarıyla kullanılabilir.",
            "Google Ads, AdSense veya benzeri reklam sistemleri ileride platforma entegre edilebilir ve reklam alanları üzerinden gösterim yapılabilir."
          ]
        }
      ]}
    />
  );
}
