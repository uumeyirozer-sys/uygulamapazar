import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { ListingForm } from "@/components/listings/listing-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "İlan Ver | UygulamaPazar.com",
  description: "UygulamaPazar.com üzerinde dijital ürününüz için modern marketplace ilanı oluşturun.",
  robots: noIndexRobots
};

export default function CreateListingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-14 md:py-20">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            İlan oluştur
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            Dijital ürününü premium marketplace vitriniyle yayına hazırla.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            Uygulama, oyun, script, WordPress ürünü, yapay zeka aracı veya tasarım kitin için alıcı odaklı bir ilan taslağı oluştur.
          </p>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          <ListingForm />
        </Container>
      </section>
    </>
  );
}
