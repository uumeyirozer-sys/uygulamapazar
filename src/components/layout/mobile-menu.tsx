"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AuthUserProfile } from "@/lib/auth";
import { getCurrentUserProfile, signOutCurrentUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";

const guestLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/kayit", label: "İlan Ver" },
  { href: "/giris", label: "Giriş" }
];

function getUserLinks(username: string) {
  return [
    { href: "/", label: "Ana Sayfa" },
    { href: "/kategoriler", label: "Kategoriler" },
    { href: "/ilan-ver", label: "İlan Ver" },
    { href: "/mesajlar", label: "Mesajlar" },
    { href: "/bildirimler", label: "Bildirimler" },
    { href: "/favoriler", label: "Favoriler" },
    { href: `/profil/${username}`, label: "Profilim" },
    { href: "/ilanlarim", label: "İlanlarım" },
    { href: "/profil-duzenle", label: "Profili Düzenle" }
  ];
}

export function MobileMenu() {
  const [authProfile, setAuthProfile] = useState<AuthUserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function loadProfile() {
      const profile = await getCurrentUserProfile();

      if (isMounted) {
        setAuthProfile(profile);
      }
    }

    void loadProfile();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOutCurrentUser();
    setAuthProfile(null);
    setIsSigningOut(false);
    setIsOpen(false);
  }

  const links = authProfile ? getUserLinks(authProfile.username) : guestLinks;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-brand-white text-brand-black shadow-sm transition hover:bg-neutral-50"
        aria-label="Menüyü aç"
        aria-expanded={isOpen}
      >
        <span className="grid gap-1.5">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="absolute inset-0 bg-neutral-950/55"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-dvh w-[min(22rem,92vw)] flex-col overflow-y-auto bg-[#111113] p-5 text-brand-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <Link href="/" onClick={() => setIsOpen(false)} className="min-w-0 text-lg font-black text-brand-white">
                Uygulama<span className="text-brand-red">Pazar</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-2xl leading-none text-brand-white"
                aria-label="Menüyü kapat"
              >
                ×
              </button>
            </div>

            {authProfile ? (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-black uppercase text-red-200">Hesap</p>
                <p className="mt-1 truncate text-sm font-black text-brand-white">@{authProfile.username}</p>
              </div>
            ) : null}

            <nav className="mt-5 grid gap-2" aria-label="Mobil menü">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="min-h-12 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-brand-white transition hover:border-brand-red/60 hover:bg-brand-red"
                >
                  {link.label}
                </Link>
              ))}
              {authProfile ? (
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={isSigningOut}
                  className="min-h-12 rounded-xl border border-white/10 bg-brand-white px-4 py-3 text-left text-sm font-black text-brand-black transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSigningOut ? "Çıkılıyor..." : "Çıkış"}
                </button>
              ) : null}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
