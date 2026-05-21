"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { categories } from "@/data/categories";
import { slugifyTr } from "@/lib/slugify-tr";
import { getSupabaseClient, type Database } from "@/lib/supabase";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

type ListingEditClientProps = {
  listingId: string;
};

const maxImageSizeBytes = 5 * 1024 * 1024;

function getShortDescription(value: string) {
  const cleanValue = value.trim().replace(/\s+/g, " ");
  return cleanValue.length <= 180 ? cleanValue : `${cleanValue.slice(0, 177).trim()}...`;
}

function sanitizeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return `${baseName || "kapak"}.${extension}`;
}

function formatListInput(values: string[] | null) {
  return (values ?? []).join(", ");
}

function parseListInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createPublicUrl(uploadedPath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");

  if (!supabaseUrl) {
    throw new Error("Supabase URL bulunamadı.");
  }

  return `${supabaseUrl}/storage/v1/object/public/listing-images/${uploadedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export function ListingEditClient({ listingId }: ListingEditClientProps) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingRow | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [subcategorySlug, setSubcategorySlug] = useState("");
  const [tags, setTags] = useState("");
  const [techStack, setTechStack] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedCategory = useMemo(() => categories.find((category) => category.slug === categorySlug), [categorySlug]);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function loadListing() {
      setIsLoading(true);
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (userError || !user) {
        router.push("/giris");
        return;
      }

      const { data, error } = await supabase.from("listings").select("*").eq("id", listingId).eq("user_id", user.id).maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("İlan yüklenemedi:", error);
        setErrorMessage("İlan yüklenemedi. Lütfen tekrar deneyin.");
      } else if (!data) {
        setErrorMessage("Bu ilanı düzenleme yetkiniz yok veya ilan bulunamadı.");
      } else {
        setListing(data);
        setTitle(data.title);
        setDescription(data.description);
        setIsFree(data.is_free);
        setPrice(data.price?.toString() ?? "");
        setCategorySlug(data.category_slug ?? "");
        setSubcategorySlug(data.subcategory_slug ?? "");
        setTags(formatListInput(data.tags));
        setTechStack(formatListInput(data.tech_stack));
        setDemoUrl(data.demo_url ?? "");
        setYoutubeUrl(data.youtube_url ?? "");
      }

      setIsLoading(false);
    }

    void loadListing();

    return () => {
      isMounted = false;
    };
  }, [listingId, router]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setErrorMessage("");

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Kapak görseli image/* türünde olmalıdır.");
      event.target.value = "";
      return;
    }

    if (file.size > maxImageSizeBytes) {
      setErrorMessage("Kapak görseli en fazla 5 MB olabilir.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
  }

  async function uploadImage(userId: string, listingSlug: string) {
    if (!imageFile) {
      return listing?.thumbnail_url ?? null;
    }

    const filePath = `${userId}/${Date.now()}-${listingSlug}-${sanitizeFileName(imageFile.name)}`;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage.from("listing-images").upload(filePath, imageFile, {
      cacheControl: "3600",
      contentType: imageFile.type,
      upsert: false
    });

    if (error || !data?.path) {
      console.error("Kapak görseli yüklenemedi:", error);
      throw new Error("Kapak görseli yüklenemedi. Lütfen tekrar deneyin.");
    }

    return createPublicUrl(data.path);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!listing) {
      setErrorMessage("Düzenlenecek ilan bulunamadı.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setErrorMessage("Başlık ve açıklama zorunludur.");
      return;
    }

    const numericPrice = Number(price);
    const parsedPrice = isFree ? null : numericPrice;

    if (!isFree && (!Number.isFinite(numericPrice) || numericPrice <= 0)) {
      setErrorMessage("Ücretli ilanlarda geçerli bir TL fiyat girin.");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/giris");
        return;
      }

      const nextSlug = slugifyTr(trimmedTitle);
      const thumbnailUrl = await uploadImage(user.id, nextSlug);
      const { data, error } = await supabase
        .from("listings")
        .update({
          title: trimmedTitle,
          slug: nextSlug,
          short_description: getShortDescription(trimmedDescription),
          description: trimmedDescription,
          price: parsedPrice,
          is_free: isFree,
          category_slug: categorySlug || null,
          subcategory_slug: subcategorySlug || null,
          tags: parseListInput(tags),
          tech_stack: parseListInput(techStack),
          demo_url: demoUrl.trim() || null,
          youtube_url: youtubeUrl.trim() || null,
          thumbnail_url: thumbnailUrl,
          status: "pending"
        })
        .eq("id", listing.id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) {
        console.error("İlan güncellenemedi:", error);
        setErrorMessage("İlan güncellenemedi. RLS policy için kullanıcıların kendi listings kayıtlarını güncelleyebilmesi gerekir.");
        return;
      }

      setListing(data);
      setImageFile(null);
      setSuccessMessage("İlan güncellendi ve admin onayına gönderildi.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "İlan güncellenemedi. Lütfen tekrar deneyin.");
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
            İlan Düzenle
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
            İlan bilgilerini güncelle.
          </h1>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container>
          {isLoading ? (
            <div className="market-card p-10 text-center text-sm font-bold text-neutral-500">İlan yükleniyor...</div>
          ) : (
            <form onSubmit={handleSubmit} className="market-card grid min-w-0 gap-5 p-5 md:p-6">
              {errorMessage ? <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-brand-red ring-1 ring-red-100">{errorMessage}</p> : null}
              {successMessage ? <p className="rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700 ring-1 ring-green-100">{successMessage}</p> : null}

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Başlık</span>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-brand-red" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Kapak Görseli</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold" />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-black text-brand-black">Açıklama</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={7} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold leading-7 outline-none focus:border-brand-red" />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Ana Kategori</span>
                  <select value={categorySlug} onChange={(event) => { setCategorySlug(event.target.value); setSubcategorySlug(""); }} className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-brand-red">
                    <option value="">Kategori seç</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>{category.title}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Alt Kategori</span>
                  <select value={subcategorySlug} onChange={(event) => setSubcategorySlug(event.target.value)} className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-brand-red">
                    <option value="">Alt kategori seç</option>
                    {selectedCategory?.subcategories.map((subcategory) => (
                      <option key={subcategory.slug} value={subcategory.slug}>{subcategory.title}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Fiyat Türü</span>
                  <select value={isFree ? "free" : "paid"} onChange={(event) => setIsFree(event.target.value === "free")} className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-brand-red">
                    <option value="paid">Ücretli</option>
                    <option value="free">Ücretsiz</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">TL Fiyat</span>
                  <input value={price} onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ""))} disabled={isFree} className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-brand-red disabled:opacity-60" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Durum</span>
                  <input value={listing?.status ?? ""} disabled className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-100 px-4 text-sm font-black text-neutral-600" />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Etiketler</span>
                  <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="SaaS, AI, Dashboard" className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-brand-red" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Tech Stack</span>
                  <input value={techStack} onChange={(event) => setTechStack(event.target.value)} placeholder="Next.js, TypeScript" className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-brand-red" />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">Demo URL</span>
                  <input value={demoUrl} onChange={(event) => setDemoUrl(event.target.value)} className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-brand-red" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-brand-black">YouTube URL</span>
                  <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none focus:border-brand-red" />
                </label>
              </div>

              <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/ilanlarim" className="btn-outline">İlanlarıma Dön</Link>
                <button type="submit" disabled={isSaving || !listing} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
                  {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          )}
        </Container>
      </section>
    </>
  );
}
