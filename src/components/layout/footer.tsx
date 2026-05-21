import Link from "next/link";
import { Container } from "@/components/ui/container";

const footerGroups = [
  {
    title: "Marketplace",
    links: [
      { label: "Trend ürünler", href: "/#trend" },
      { label: "Yeni eklenenler", href: "/#yeni-eklenenler" },
      { label: "Kategoriler", href: "/kategoriler" },
      { label: "İlan Ver", href: "/ilan-ver" }
    ]
  },
  {
    title: "UygulamaPazar",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "İletişim", href: "/iletisim" },
      { label: "İlan Kuralları", href: "/ilan-kurallari" }
    ]
  },
  {
    title: "Hukuki",
    links: [
      { label: "Kullanım Şartları", href: "/kullanim-sartlari" },
      { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#111113] text-brand-white">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.15fr_2fr] md:py-14">
        <div>
          <Link href="/" className="flex items-center gap-2 text-brand-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-red text-sm font-black text-brand-white">
              UP
            </span>
            <span className="text-xl font-black">
              Uygulama<span className="text-brand-red">Pazar</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-400">
            Satışa hazır uygulama, oyun, script ve tasarım ürünleri için modern dijital ürün pazarı.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-black uppercase text-brand-white">{group.title}</h2>
              <div className="mt-4 grid gap-3">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-semibold text-neutral-400 transition duration-200 ease-premium hover:text-brand-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
      <Container className="flex flex-col gap-3 border-t border-white/10 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-neutral-500">© 2026 UygulamaPazar.com</p>
        <div className="flex gap-4 text-sm font-semibold text-neutral-500">
          <Link href="/gizlilik-politikasi" className="transition hover:text-brand-white">
            Gizlilik
          </Link>
          <Link href="/kullanim-sartlari" className="transition hover:text-brand-white">
            Kullanım
          </Link>
        </div>
      </Container>
    </footer>
  );
}
