"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ensureUserProfile, getFriendlyAuthError } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";

type AuthMode = "login" | "register";

type Errors = Partial<Record<"username" | "displayName" | "email" | "password" | "confirmPassword" | "terms", string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-z0-9-]+$/;

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  function validate() {
    const nextErrors: Errors = {};

    if (!isLogin) {
      if (!username.trim()) {
        nextErrors.username = "Kullanıcı adı zorunludur.";
      } else if (!usernamePattern.test(username.trim())) {
        nextErrors.username = "Kullanıcı adı küçük harf, rakam ve tire içermelidir.";
      }

      if (!displayName.trim()) {
        nextErrors.displayName = "Görünen ad zorunludur.";
      }
    }

    if (!email.trim()) {
      nextErrors.email = "E-posta zorunludur.";
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = "Geçerli bir e-posta adresi girin.";
    }

    if (!password) {
      nextErrors.password = "Şifre zorunludur.";
    } else if (password.length < 8) {
      nextErrors.password = "Şifre en az 8 karakter olmalıdır.";
    }

    if (!isLogin) {
      if (!confirmPassword) {
        nextErrors.confirmPassword = "Şifre tekrar zorunludur.";
      } else if (confirmPassword !== password) {
        nextErrors.confirmPassword = "Şifreler eşleşmiyor.";
      }

      if (!acceptedTerms) {
        nextErrors.terms = "Kullanım şartlarını onaylamalısınız.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    setSubmitError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) {
          setSubmitError(getFriendlyAuthError(error.message));
          return;
        }

        if (!data.user) {
          setSubmitError("Giriş yapılamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.");
          return;
        }

        try {
          await ensureUserProfile(data.user);
        } catch {
          setSubmitError("Giriş başarılı ancak profil bilgileri hazırlanamadı. Lütfen tekrar deneyin.");
          return;
        }

        router.push("/");
        router.refresh();
        return;
      }

      const cleanUsername = username.trim().toLowerCase();
      const cleanDisplayName = displayName.trim();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: cleanDisplayName
          }
        }
      });

      if (error) {
        setSubmitError(getFriendlyAuthError(error.message));
        return;
      }

      if (!data.user) {
        setSubmitError("Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.");
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setSuccessMessage("Kayıt başarılı. Lütfen e-posta adresinize gelen doğrulama bağlantısına tıklayın. Doğrulama sonrası giriş yapabilirsiniz.");
    } catch {
      setSubmitError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="market-card p-5 md:p-7">
      <div className="mb-7">
        <p className="tag-text text-brand-red">{isLogin ? "Giriş" : "Kayıt"}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-brand-black">
          {isLogin ? "Hesabına giriş yap" : "Yeni hesap oluştur"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          {isLogin
            ? "İlanlarını, mesajlarını ve profilini yönetmek için giriş ekranı tasarım önizlemesi."
            : "Dijital ürünlerini yayınlamak ve satıcı profilini oluşturmak için kayıt ekranı tasarım önizlemesi."}
        </p>
      </div>

      <div className="grid gap-4">
        {!isLogin ? (
          <>
            <label className="grid gap-2">
              <span className="text-sm font-black text-brand-black">Kullanıcı adı</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
                placeholder="kodustasi"
              />
              {errors.username ? <span className="text-xs font-bold text-brand-red">{errors.username}</span> : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-brand-black">Görünen ad</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
                placeholder="Kod Ustası"
              />
              {errors.displayName ? <span className="text-xs font-bold text-brand-red">{errors.displayName}</span> : null}
            </label>
          </>
        ) : null}

        <label className="grid gap-2">
          <span className="text-sm font-black text-brand-black">E-posta</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
            placeholder="ornek@uygulamapazar.com"
            type="email"
          />
          {errors.email ? <span className="text-xs font-bold text-brand-red">{errors.email}</span> : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-brand-black">Şifre</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
            placeholder="En az 8 karakter"
            type="password"
          />
          {errors.password ? <span className="text-xs font-bold text-brand-red">{errors.password}</span> : null}
        </label>

        {!isLogin ? (
          <label className="grid gap-2">
            <span className="text-sm font-black text-brand-black">Şifre tekrar</span>
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
              placeholder="Şifrenizi tekrar girin"
              type="password"
            />
            {errors.confirmPassword ? <span className="text-xs font-bold text-brand-red">{errors.confirmPassword}</span> : null}
          </label>
        ) : null}

        {isLogin ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-600">
              <input
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 accent-red-600"
              />
              Beni hatırla
            </label>
            <Link href="/" className="text-sm font-black text-brand-red transition hover:text-brand-red-hover">
              Şifremi unuttum
            </Link>
          </div>
        ) : (
          <div>
            <label className="flex items-start gap-3 text-sm font-bold leading-6 text-neutral-600">
              <input
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-neutral-300 accent-red-600"
              />
              Kullanım şartlarını ve platform kurallarını kabul ediyorum.
            </label>
            {errors.terms ? <p className="mt-2 text-xs font-bold text-brand-red">{errors.terms}</p> : null}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full min-h-12 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? "İşleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
        </button>

        {submitError ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-brand-red ring-1 ring-red-100">
            {submitError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-brand-red ring-1 ring-red-100">
            {successMessage}
          </div>
        ) : null}

        <p className="text-center text-sm font-semibold text-neutral-600">
          {isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}{" "}
          <Link href={isLogin ? "/kayit" : "/giris"} className="font-black text-brand-red transition hover:text-brand-red-hover">
            {isLogin ? "Kayıt ol" : "Giriş yap"}
          </Link>
        </p>
      </div>
    </form>
  );
}
