import type { Metadata } from "next";
import { ContactForm } from "@/components/info/contact-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "İletişim | UygulamaPazar.com",
  description: "UygulamaPazar.com iletişim sayfası."
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-12 md:py-16">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            İletişim
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            Platform hakkında bizimle iletişime geçin.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            İlan, profil, kategori veya iş birliği konularında bize ulaşmak için mock iletişim formunu kullanabilirsiniz.
          </p>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
          <ContactForm />
          <aside className="market-card bg-[#141416] p-6 text-brand-white">
            <p className="tag-text text-red-200">Bilgilendirme</p>
            <h2 className="mt-2 text-2xl font-black text-brand-white">UygulamaPazar ne yapmaz?</h2>
            <p className="mt-4 text-sm leading-7 text-neutral-300">
              UygulamaPazar ödeme, dosya teslimi veya satış sonrası destek aracılığı yapmaz. Kullanıcılar yalnızca platform içinde ilan ve mesajlaşma üzerinden buluşturulur.
            </p>
          </aside>
        </Container>
      </section>
    </>
  );
}
