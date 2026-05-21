"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ensureUserProfile } from "@/lib/auth";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const maxAvatarSize = 5 * 1024 * 1024;
const usernamePattern = /^[a-z0-9-]+$/;

function getInitials(displayName: string) {
  return (
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
      .join("") || "UP"
  );
}

function formatSocialLinks(value: ProfileRow["social_links"]) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object" && "href" in item && typeof item.href === "string") {
        return item.href;
      }

      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function parseSocialLinks(value: string) {
  const links = value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  return links.length > 0
    ? links.map((href) => ({
        label: href.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || href,
        href
      }))
    : null;
}

export function ProfileEditClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function loadProfile() {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (error || !user) {
        router.push("/giris");
        return;
      }

      try {
        const currentProfile = await ensureUserProfile(user);

        if (!isMounted) {
          return;
        }

        setProfile(currentProfile);
        setUsername(currentProfile.username);
        setDisplayName(currentProfile.display_name);
        setBio(currentProfile.bio ?? "");
        setAvatarUrl(currentProfile.avatar_url);
        setSocialLinks(formatSocialLinks(currentProfile.social_links));
      } catch (profileError) {
        console.error("Profil bilgileri yüklenemedi:", profileError);
        setErrorMessage("Profil bilgileri yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    setErrorMessage("");
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setAvatarFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Avatar için yalnızca görsel dosyası seçebilirsiniz.");
      event.target.value = "";
      return;
    }

    if (file.size > maxAvatarSize) {
      setErrorMessage("Avatar dosyası en fazla 5 MB olabilir.");
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
  }

  async function uploadAvatar(userId: string) {
    if (!avatarFile) {
      return avatarUrl;
    }

    const supabase = getSupabaseClient();
    const extension = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${userId}/${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, avatarFile, {
      cacheControl: "3600",
      upsert: true
    });

    if (error) {
      console.error("Avatar yüklenemedi:", error);
      throw new Error("Avatar yüklenemedi. Lütfen tekrar deneyin.");
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedDisplayName = displayName.trim();
    const trimmedBio = bio.trim();

    if (!trimmedUsername) {
      setErrorMessage("Kullanıcı adı zorunludur.");
      return;
    }

    if (!usernamePattern.test(trimmedUsername)) {
      setErrorMessage("Kullanıcı adı küçük harf, rakam ve tire içermelidir.");
      return;
    }

    if (!trimmedDisplayName) {
      setErrorMessage("Görünen ad zorunludur.");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user || !profile) {
        router.push("/giris");
        return;
      }

      const nextAvatarUrl = await uploadAvatar(user.id);
      const { data, error } = await supabase
        .from("profiles")
        .update({
          username: trimmedUsername,
          display_name: trimmedDisplayName,
          bio: trimmedBio || null,
          avatar_url: nextAvatarUrl,
          social_links: parseSocialLinks(socialLinks)
        })
        .eq("id", user.id)
        .select("*")
        .single();

      if (error) {
        console.error("Profil güncellenemedi:", error);
        setErrorMessage("Profil güncellenemedi. Kullanıcı adı kullanımda olabilir.");
        return;
      }

      setProfile(data);
      setUsername(data.username);
      setDisplayName(data.display_name);
      setBio(data.bio ?? "");
      setAvatarUrl(data.avatar_url);
      setSocialLinks(formatSocialLinks(data.social_links));
      setAvatarFile(null);
      setStatusMessage("Profiliniz başarıyla güncellendi.");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Profil güncellenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-12 md:py-16">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            Profil
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            Profil bilgilerini düzenle.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            Görünen adını, kullanıcı adını, biyografini ve avatarını güncelle.
          </p>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          {isLoading ? (
            <div className="market-card p-10 text-center text-sm font-bold text-neutral-500">Profil yükleniyor...</div>
          ) : (
            <form onSubmit={handleSubmit} className="market-card min-w-0 overflow-hidden bg-brand-white">
              <div className="grid gap-6 border-b border-neutral-100 p-6 md:grid-cols-[160px_1fr]">
                <div>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={displayName} className="h-32 w-32 rounded-full object-cover ring-8 ring-neutral-100" />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-neutral-950 text-3xl font-black text-brand-white ring-8 ring-neutral-100">
                      {getInitials(displayName || username)}
                    </div>
                  )}
                </div>
                <div className="grid gap-5">
                  <label className="grid gap-2">
                    <span className="text-sm font-black text-brand-black">Avatar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700"
                    />
                    <span className="text-xs font-bold text-neutral-500">PNG/JPG/WebP, maksimum 5 MB.</span>
                  </label>
                </div>
              </div>

              <div className="grid gap-5 p-6">
                {errorMessage ? <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-brand-red ring-1 ring-red-100">{errorMessage}</p> : null}
                {statusMessage ? <p className="rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700 ring-1 ring-green-100">{statusMessage}</p> : null}

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-black text-brand-black">Kullanıcı adı</span>
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red focus:bg-brand-white"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-black text-brand-black">Görünen ad</span>
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red focus:bg-brand-white"
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Bio</span>
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={5}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold leading-6 outline-none transition focus:border-brand-red focus:bg-brand-white"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Sosyal medya linkleri</span>
                  <textarea
                    value={socialLinks}
                    onChange={(event) => setSocialLinks(event.target.value)}
                    rows={3}
                    placeholder="Örn: https://github.com/kullanici"
                    className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold leading-6 outline-none transition focus:border-brand-red focus:bg-brand-white"
                  />
                </label>

                <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={profile ? `/profil/${profile.username}` : "/"} className="btn-outline">
                    Profili Gör
                  </Link>
                  <button type="submit" disabled={isSaving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
                    {isSaving ? "Kaydediliyor..." : "Profili Kaydet"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </Container>
      </section>
    </>
  );
}
