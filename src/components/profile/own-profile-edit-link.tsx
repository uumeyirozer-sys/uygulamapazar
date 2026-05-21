"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";

type OwnProfileEditLinkProps = {
  profileId?: string;
};

export function OwnProfileEditLink({ profileId }: OwnProfileEditLinkProps) {
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function checkProfileOwner() {
      if (!profileId) {
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (isMounted) {
        setIsOwnProfile(user?.id === profileId);
      }
    }

    void checkProfileOwner();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  if (!isOwnProfile) {
    return null;
  }

  return (
    <>
      <Link href="/profil-duzenle" className="btn-outline w-full sm:w-auto">
        Profili Düzenle
      </Link>
      <Link href="/ilanlarim" className="btn-secondary w-full sm:w-auto">
        İlanlarım
      </Link>
    </>
  );
}
