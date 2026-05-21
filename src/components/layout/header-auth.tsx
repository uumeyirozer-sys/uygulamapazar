"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AuthUserProfile } from "@/lib/auth";
import { getCurrentUserProfile } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";

export function HeaderAuth() {
  const [authProfile, setAuthProfile] = useState<AuthUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function loadProfile() {
      const profile = await getCurrentUserProfile();

      if (isMounted) {
        setAuthProfile(profile);
        setIsLoading(false);
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

  if (isLoading) {
    return <div className="hidden h-10 w-28 rounded-xl bg-neutral-100 sm:block" aria-hidden="true" />;
  }

  if (!authProfile) {
    return (
      <>
        <Link href="/kayit" className="btn-primary min-h-10 px-4 shadow-[0_10px_22px_rgba(229,9,20,0.18)]">
          İlan Ver
        </Link>
        <Link href="/giris" className="btn-outline min-h-10 px-4 max-sm:hidden">
          Giriş
        </Link>
      </>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Link
        href={`/profil/${authProfile.username}`}
        className="hidden min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-black text-brand-black transition hover:border-red-100 hover:bg-red-50 hover:text-brand-red sm:block"
      >
        @{authProfile.username}
      </Link>
      <Link href="/ilan-ver" className="btn-primary min-h-10 px-4 shadow-[0_10px_22px_rgba(229,9,20,0.18)]">
        İlan Ver
      </Link>
    </div>
  );
}
