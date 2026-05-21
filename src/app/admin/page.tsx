import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Admin Panel | UygulamaPazar.com",
  description: "UygulamaPazar.com admin dashboard arayüzü.",
  robots: noIndexRobots
};

export default function AdminPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-12 md:py-16">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            Admin Panel
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            Marketplace operasyonlarını tek ekrandan izle.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            İlan onayı, kullanıcı takibi, reklam alanları ve raporlanan içerikler için Supabase bağlantılı admin dashboard.
          </p>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          <AdminDashboard />
        </Container>
      </section>
    </>
  );
}
