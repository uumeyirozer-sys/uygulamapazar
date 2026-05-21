import Link from "next/link";
import { HeaderAuth } from "@/components/layout/header-auth";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NotificationBadgeLink } from "@/components/layout/notification-badge-link";
import { Container } from "@/components/ui/container";

const navItems = [
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/mesajlar", label: "Mesajlar" },
  { href: "/favoriler", label: "Favoriler" },
  { href: "/#trend", label: "Trend" },
  { href: "/#yeni-eklenenler", label: "Yeni Eklenenler" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-brand-white/90 shadow-[0_1px_0_rgba(9,9,11,0.03)] backdrop-blur-xl">
      <Container className="flex min-h-[4.5rem] items-center gap-3 md:gap-6">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2 text-brand-black">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-sm font-black text-brand-white shadow-[0_12px_28px_rgba(9,9,11,0.16)] transition duration-200 ease-premium group-hover:bg-brand-red">
            UP
          </span>
          <span className="truncate text-lg font-black tracking-normal">
            Uygulama<span className="text-brand-red">Pazar</span>
          </span>
        </Link>

        <form action="/arama" className="hidden min-w-0 flex-1 md:block">
          <label className="sr-only" htmlFor="site-search">
            Ürün ara
          </label>
          <div className="flex h-11 items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 transition duration-200 ease-premium focus-within:border-brand-red/50 focus-within:bg-brand-white focus-within:shadow-[0_10px_28px_rgba(9,9,11,0.07)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-neutral-500" fill="none" aria-hidden="true">
              <path d="m20 20-4.2-4.2M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              id="site-search"
              name="q"
              className="h-full w-full bg-transparent text-sm font-semibold text-brand-black outline-none placeholder:text-neutral-500"
              placeholder="Ürün, kategori veya teknoloji ara"
            />
          </div>
        </form>

        <nav aria-label="Ana menü" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-600 transition duration-200 ease-premium hover:bg-neutral-100 hover:text-brand-black"
            >
              {item.label}
            </Link>
          ))}
          <NotificationBadgeLink />
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <HeaderAuth />
        </div>
        <div className="ml-auto md:hidden">
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
