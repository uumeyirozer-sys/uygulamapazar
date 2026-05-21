"use client";

import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { categories } from "@/data/categories";
import { getFriendlyAuthError } from "@/lib/auth";
import { slugifyTr } from "@/lib/slugify-tr";
import { getSupabaseClient } from "@/lib/supabase";

const platforms = [
  "Android",
  "iOS",
  "Flutter",
  "React Native",
  "Unity",
  "PHP",
  "Laravel",
  "WordPress",
  "Web",
  "Yapay Zeka"
];

const maxImageSizeBytes = 5 * 1024 * 1024;

type PreviewImage = {
  id: string;
  name: string;
  url: string;
  file: File;
};

type Errors = Partial<Record<"title" | "category" | "subcategory" | "description" | "images" | "keywords" | "price", string>>;

export function ListingForm() {
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [subcategorySlug, setSubcategorySlug] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [pricingType, setPricingType] = useState<"free" | "paid">("paid");
  const [price, setPrice] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imagesRef = useRef<PreviewImage[]>([]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug === categorySlug),
    [categorySlug]
  );

  const selectedSubcategory = useMemo(
    () => selectedCategory?.subcategories.find((subcategory) => subcategory.slug === subcategorySlug),
    [selectedCategory, subcategorySlug]
  );

  const coverImage = images.find((image) => image.id === coverImageId) ?? images[0];

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  function validateForm() {
    const nextErrors: Errors = {};

    if (!title.trim()) {
      nextErrors.title = "Ürün başlığı zorunludur.";
    }

    if (!categorySlug) {
      nextErrors.category = "Ana kategori seçilmelidir.";
    }

    if (!subcategorySlug) {
      nextErrors.subcategory = "Alt kategori seçilmelidir.";
    }

    if (!description.trim()) {
      nextErrors.description = "Açıklama zorunludur.";
    }

    if (images.length < 1) {
      nextErrors.images = "En az 1 görsel eklemelisiniz.";
    }

    if (keywords.length < 5) {
      nextErrors.keywords = "En az 5 anahtar kelime eklemelisiniz.";
    }

    if (pricingType === "paid" && !price.trim()) {
      nextErrors.price = "Ücretli ilanlarda TL fiyat zorunludur.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function resetForm() {
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    imagesRef.current = [];
    setTitle("");
    setCategorySlug("");
    setSubcategorySlug("");
    setDescription("");
    setImages([]);
    setCoverImageId(null);
    setPricingType("paid");
    setPrice("");
    setSelectedPlatforms([]);
    setKeywordInput("");
    setKeywords([]);
    setYoutubeUrl("");
    setDemoUrl("");
    setErrors({});
  }

  function getShortDescription(value: string) {
    const cleanValue = value.trim().replace(/\s+/g, " ");

    if (cleanValue.length <= 180) {
      return cleanValue;
    }

    return `${cleanValue.slice(0, 177).trim()}...`;
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

  function normalizeStoragePath(path: string) {
    return path
      .replace(/^\/+/, "")
      .replace(/^listing-images\/+/i, "")
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");
  }

  function createListingImagePublicUrl(uploadedPath: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");

    if (!supabaseUrl) {
      throw new Error("Supabase URL bulunamadı. Lütfen ortam değişkenlerini kontrol edin.");
    }

    const normalizedPath = normalizeStoragePath(uploadedPath);

    if (!normalizedPath) {
      throw new Error("Kapak görseli dosya yolu geçersiz.");
    }

    return {
      normalizedPath,
      publicUrl: `${supabaseUrl}/storage/v1/object/public/listing-images/${normalizedPath}`
    };
  }

  async function uploadCoverImage(userId: string, listingSlug: string) {
    if (!coverImage) {
      throw new Error("Kapak görseli bulunamadı.");
    }

    if (!coverImage.file.type.startsWith("image/")) {
      throw new Error("Kapak görseli image/* türünde olmalıdır.");
    }

    if (coverImage.file.size > maxImageSizeBytes) {
      throw new Error("Kapak görseli en fazla 5 MB olabilir.");
    }

    const filePath = `${userId}/${Date.now()}-${listingSlug}-${sanitizeFileName(coverImage.file.name)}`;
    const supabase = getSupabaseClient();
    const { data: uploadData, error } = await supabase.storage
      .from("listing-images")
      .upload(filePath, coverImage.file, {
        cacheControl: "3600",
        contentType: coverImage.file.type,
        upsert: false
      });

    if (error) {
      throw new Error("Kapak görseli yüklenemedi. Lütfen tekrar deneyin.");
    }

    const uploadedPath = uploadData?.path;

    if (!uploadedPath) {
      throw new Error("Kapak görseli yüklendi ancak dosya yolu alınamadı.");
    }

    const { normalizedPath, publicUrl } = createListingImagePublicUrl(uploadedPath);

    console.log("listing thumbnail uploadedPath:", normalizedPath);
    console.log("listing thumbnail publicUrl:", publicUrl);

    if (!publicUrl) {
      throw new Error("Kapak görseli public URL değeri alınamadı.");
    }

    try {
      const url = new URL(publicUrl);
      const isListingImageUrl = url.pathname.includes("/storage/v1/object/public/listing-images/");

      if (!isListingImageUrl) {
        throw new Error("invalid-storage-url");
      }
    } catch {
      throw new Error("Kapak görseli public URL formatı geçersiz.");
    }

    return publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setSubmitError("İlan vermek için giriş yapmalısınız. Lütfen giriş yaptıktan sonra tekrar deneyin.");
        return;
      }

      const isFree = pricingType === "free";
      const parsedPrice = isFree ? null : Number(price);
      const listingSlug = slugifyTr(title);

      if (!isFree && (parsedPrice === null || !Number.isFinite(parsedPrice) || parsedPrice <= 0)) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          price: "Ücretli ilanlarda geçerli bir TL fiyat girin."
        }));
        return;
      }

      let thumbnailUrl: string;

      try {
        thumbnailUrl = await uploadCoverImage(user.id, listingSlug);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Kapak görseli yüklenemedi. Lütfen tekrar deneyin.");
        return;
      }

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        category_id: null,
        category_slug: selectedCategory?.slug ?? null,
        subcategory_slug: selectedSubcategory?.slug ?? null,
        title: title.trim(),
        slug: listingSlug,
        short_description: getShortDescription(description),
        description: description.trim(),
        price: parsedPrice,
        is_free: isFree,
        status: "pending",
        thumbnail_url: thumbnailUrl,
        demo_url: demoUrl.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
        tags: keywords,
        tech_stack: selectedPlatforms
      });

      if (error) {
        setSubmitError(getFriendlyAuthError(error.message));
        return;
      }

      resetForm();
      setSuccessMessage("İlanınız admin onayına gönderildi.");
    } catch {
      setSubmitError("İlan kaydedilirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCategoryChange(value: string) {
    setCategorySlug(value);
    setSubcategorySlug("");
  }

  function createImageId(file: File) {
    const randomId =
      typeof globalThis.crypto?.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return `${file.name}-${file.lastModified}-${randomId}`;
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;

    if (!fileList || fileList.length === 0) {
      event.target.value = "";
      return;
    }

    const allFiles = Array.from(fileList);
    const invalidTypeFile = allFiles.find((file) => !file.type.startsWith("image/"));
    const oversizedFile = allFiles.find((file) => file.size > maxImageSizeBytes);

    if (invalidTypeFile) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        images: "Yalnızca görsel dosyaları seçebilirsiniz."
      }));
      event.target.value = "";
      return;
    }

    if (oversizedFile) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        images: "Her görsel en fazla 5 MB olabilir."
      }));
      event.target.value = "";
      return;
    }

    const selectedFiles = allFiles.filter((file) => file.type.startsWith("image/"));
    const nextImages = selectedFiles.map((file) => ({
      id: createImageId(file),
      name: file.name,
      url: URL.createObjectURL(file),
      file
    }));

    if (nextImages.length === 0) {
      event.target.value = "";
      return;
    }

    setImages((currentImages) => {
      const availableSlots = Math.max(0, 10 - currentImages.length);
      const acceptedImages = nextImages.slice(0, availableSlots);
      const rejectedImages = nextImages.slice(availableSlots);

      rejectedImages.forEach((image) => URL.revokeObjectURL(image.url));

      if (acceptedImages.length === 0) {
        return currentImages;
      }

      setErrors((currentErrors) => ({
        ...currentErrors,
        images: undefined
      }));

      setCoverImageId((currentCoverImageId) => currentCoverImageId ?? currentImages[0]?.id ?? acceptedImages[0]?.id ?? null);

      return [...currentImages, ...acceptedImages];
    });

    event.target.value = "";
  }

  function removeImage(imageId: string) {
    setImages((currentImages) => {
      const removedImage = currentImages.find((image) => image.id === imageId);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.url);
      }
      const nextImages = currentImages.filter((image) => image.id !== imageId);
      if (coverImageId === imageId) {
        setCoverImageId(nextImages[0]?.id ?? null);
      }
      return nextImages;
    });
  }

  function togglePlatform(platform: string) {
    setSelectedPlatforms((currentPlatforms) =>
      currentPlatforms.includes(platform)
        ? currentPlatforms.filter((currentPlatform) => currentPlatform !== platform)
        : [...currentPlatforms, platform]
    );
  }

  function addKeyword(value: string) {
    const keyword = value.trim().replace(/,$/, "");
    if (!keyword || keywords.includes(keyword) || keywords.length >= 12) {
      setKeywordInput("");
      return;
    }

    setKeywords((currentKeywords) => [...currentKeywords, keyword]);
    setKeywordInput("");
  }

  function handleKeywordKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addKeyword(keywordInput);
    }

    if (event.key === "Backspace" && !keywordInput && keywords.length > 0) {
      setKeywords((currentKeywords) => currentKeywords.slice(0, -1));
    }
  }

  const descriptionWarning =
    description.trim().length > 0 && description.trim().length < 120
      ? "Daha güçlü bir ilan için açıklamayı en az 120 karakter civarında tutmanız önerilir."
      : "";

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <form onSubmit={handleSubmit} className="grid min-w-0 gap-6">
        <section className="market-card p-5 md:p-6">
          <div className="mb-6">
            <p className="tag-text text-brand-red">Temel Bilgiler</p>
            <h2 className="mt-2 text-2xl font-black text-brand-black">Ürününü tanıt</h2>
          </div>

          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-black text-brand-black">Ürün Başlığı</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
                placeholder="Örn: Flutter Yemek Sipariş Uygulaması"
              />
              <span className="text-xs font-semibold text-neutral-500">SEO uyumlu, anlaşılır ve satın alma niyeti taşıyan bir başlık kullanın.</span>
              {errors.title ? <span className="text-xs font-bold text-brand-red">{errors.title}</span> : null}
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-black text-brand-black">Ana Kategori</span>
                <select
                  value={categorySlug}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
                >
                  <option value="">Kategori seç</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
                {errors.category ? <span className="text-xs font-bold text-brand-red">{errors.category}</span> : null}
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-brand-black">Alt Kategori</span>
                <select
                  value={subcategorySlug}
                  onChange={(event) => setSubcategorySlug(event.target.value)}
                  disabled={!selectedCategory}
                  className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Alt kategori seç</option>
                  {selectedCategory?.subcategories.map((subcategory) => (
                    <option key={subcategory.slug} value={subcategory.slug}>
                      {subcategory.title}
                    </option>
                  ))}
                </select>
                {errors.subcategory ? <span className="text-xs font-bold text-brand-red">{errors.subcategory}</span> : null}
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-black text-brand-black">Açıklama</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={7}
                className="resize-y rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
                placeholder="Ürünün ne işe yaradığını, öne çıkan özelliklerini, kullanım alanlarını ve alıcının neleri teslim alacağını anlatın."
              />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-semibold text-neutral-500">{description.trim().length} karakter</span>
                {descriptionWarning ? <span className="text-xs font-bold text-brand-red">{descriptionWarning}</span> : null}
              </div>
              {errors.description ? <span className="text-xs font-bold text-brand-red">{errors.description}</span> : null}
            </label>
          </div>
        </section>

        <section className="market-card p-5 md:p-6">
          <div className="mb-6">
            <p className="tag-text text-brand-red">Medya</p>
            <h2 className="mt-2 text-2xl font-black text-brand-black">Görseller ve video</h2>
          </div>

          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center transition hover:border-brand-red/50 hover:bg-red-50/40">
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleImageChange}
            />
            <span className="text-base font-black text-brand-black">Görsel ekle</span>
            <span className="mt-2 max-w-sm text-sm font-semibold leading-6 text-neutral-500">
              En az 1, en fazla 10 görsel ekleyin. İlk görsel kapak olarak kullanılabilir.
            </span>
          </label>
          {errors.images ? <p className="mt-2 text-xs font-bold text-brand-red">{errors.images}</p> : null}

          {images.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-brand-white">
                  <button
                    type="button"
                    onClick={() => setCoverImageId(image.id)}
                    className="block aspect-[16/10] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${image.url})` }}
                    aria-label={`${image.name} kapak görseli yap`}
                  />
                  <div className="flex items-center justify-between gap-2 p-3">
                    <span className="truncate text-xs font-bold text-neutral-600">{image.name}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      {coverImage?.id === image.id ? (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-[0.68rem] font-black text-brand-red">Kapak</span>
                      ) : null}
                      <button type="button" onClick={() => removeImage(image.id)} className="text-xs font-black text-neutral-500 transition hover:text-brand-red">
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black text-brand-black">YouTube Video Linki</span>
              <input
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
                placeholder="https://youtube.com/..."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-brand-black">Demo Linki</span>
              <input
                value={demoUrl}
                onChange={(event) => setDemoUrl(event.target.value)}
                className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
                placeholder="Play Store, App Store, GitHub veya canlı demo"
              />
            </label>
          </div>

          {youtubeUrl ? (
            <div className="mt-5 rounded-2xl bg-neutral-950 p-4 text-brand-white">
              <p className="text-xs font-black uppercase text-red-200">Video önizleme</p>
              <p className="mt-2 break-all text-sm font-semibold text-neutral-300">{youtubeUrl}</p>
            </div>
          ) : null}
        </section>

        <section className="market-card p-5 md:p-6">
          <div className="mb-6">
            <p className="tag-text text-brand-red">Satış Bilgileri</p>
            <h2 className="mt-2 text-2xl font-black text-brand-black">Fiyat, platform ve SEO</h2>
          </div>

          <div className="grid gap-6">
            <div>
              <span className="text-sm font-black text-brand-black">Fiyat Türü</span>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  { value: "paid", label: "Ücretli" },
                  { value: "free", label: "Ücretsiz" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPricingType(option.value as "free" | "paid")}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-black transition ${
                      pricingType === option.value
                        ? "border-brand-red bg-red-50 text-brand-red"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {pricingType === "paid" ? (
              <label className="grid gap-2">
                <span className="text-sm font-black text-brand-black">TL Fiyat</span>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ""))}
                  inputMode="numeric"
                  className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
                  placeholder="Örn: 12500"
                />
                {errors.price ? <span className="text-xs font-bold text-brand-red">{errors.price}</span> : null}
              </label>
            ) : null}

            <div>
              <span className="text-sm font-black text-brand-black">Teknoloji / Platform</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`rounded-full px-3.5 py-2 text-sm font-black transition ${
                      selectedPlatforms.includes(platform)
                        ? "bg-neutral-950 text-brand-white"
                        : "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200 hover:bg-red-50 hover:text-brand-red"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-black text-brand-black">Anahtar Kelimeler</span>
              <p className="mt-1 text-xs font-semibold text-neutral-500">
                SEO görünürlüğü için ürün teknolojisini, kullanım alanını ve hedef kitleyi anlatan en az 5 kelime ekleyin.
              </p>
              <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 transition focus-within:border-brand-red/50 focus-within:bg-brand-white">
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => setKeywords((currentKeywords) => currentKeywords.filter((currentKeyword) => currentKeyword !== keyword))}
                      className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-black text-brand-white"
                    >
                      {keyword}
                    </button>
                  ))}
                  <input
                    value={keywordInput}
                    onChange={(event) => setKeywordInput(event.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                    onBlur={() => addKeyword(keywordInput)}
                    className="min-h-8 min-w-36 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-500"
                    placeholder="Kelime yaz, Enter'a bas"
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs font-semibold text-neutral-500">
                <span>{keywords.length}/12 anahtar kelime</span>
                {errors.keywords ? <span className="font-bold text-brand-red">{errors.keywords}</span> : null}
              </div>
            </div>
          </div>
        </section>

        <section className="market-card bg-[#141416] p-5 text-brand-white md:p-6">
          <p className="text-sm font-semibold leading-7 text-neutral-300">
            İlanınız admin onayından sonra yayına alınır. UygulamaPazar dosya veya ödeme aracılığı yapmaz; kullanıcıları yalnızca platform içinde buluşturur.
          </p>
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-5 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? "Gönderiliyor..." : "Admin Onayına Gönder"}
          </button>
          {submitError ? (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-100">
              <p>{submitError}</p>
              {submitError.includes("giriş") ? (
                <Link href="/giris" className="mt-2 inline-flex text-brand-white underline underline-offset-4">
                  Giriş sayfasına git
                </Link>
              ) : null}
            </div>
          ) : null}
          {successMessage ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/10 p-4 text-sm font-bold text-brand-white">
              {successMessage}
            </div>
          ) : null}
        </section>
      </form>

      <aside className="market-card sticky top-24 overflow-hidden">
        <div
          className={`aspect-[16/10] bg-gradient-to-br ${coverImage ? "" : "from-red-600 via-neutral-950 to-neutral-800"}`}
          style={coverImage ? { backgroundImage: `url(${coverImage.url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        />
        <div className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-brand-red">
              {selectedCategory?.title || "Kategori"}
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-600">
              {selectedSubcategory?.title || "Alt kategori"}
            </span>
          </div>
          <h2 className="text-2xl font-black leading-8 text-brand-black">
            {title || "Ürün başlığınız burada görünecek"}
          </h2>
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-neutral-600">
            {description || "Açıklama alanına yazdığınız metin ilan kartı önizlemesinde kısa biçimde gösterilir."}
          </p>
          <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-5">
            <span className="text-lg font-black text-brand-black">
              {pricingType === "free" ? "Ücretsiz" : price ? `${Number(price).toLocaleString("tr-TR")} TL` : "Fiyat"}
            </span>
            <span className="text-sm font-black text-brand-red">Önizleme</span>
          </div>
          {selectedPlatforms.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedPlatforms.slice(0, 4).map((platform) => (
                <span key={platform} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                  {platform}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
