import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, type Database } from "@/lib/supabase";

export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export type AuthUserProfile = {
  user: User;
  profile: UserProfile | null;
  username: string;
  displayName: string;
};

type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

function getAuthErrorDetails(error: unknown): AuthErrorLike {
  if (typeof error === "string") {
    return { message: error };
  }

  if (error && typeof error === "object") {
    const candidate = error as AuthErrorLike;
    return {
      code: typeof candidate.code === "string" ? candidate.code : undefined,
      message: typeof candidate.message === "string" ? candidate.message : undefined,
      status: typeof candidate.status === "number" ? candidate.status : undefined
    };
  }

  return {};
}

export function getFriendlyAuthError(error: unknown) {
  const { code, message = "", status } = getAuthErrorDetails(error);
  const normalizedCode = code?.toLowerCase() ?? "";
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("supabase ortam değişkenleri eksik") ||
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("networkerror") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("fetch")
  ) {
    return "Supabase bağlantısı kurulamadı.";
  }

  if (
    status === 401 ||
    normalizedCode.includes("invalid_api_key") ||
    normalizedMessage.includes("invalid api key") ||
    normalizedMessage.includes("invalid jwt") ||
    normalizedMessage.includes("jwt")
  ) {
    return "Geçersiz Supabase anahtarı.";
  }

  if (normalizedCode.includes("invalid_credentials") || normalizedMessage.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı.";
  }

  if (
    normalizedCode.includes("email_not_confirmed") ||
    normalizedMessage.includes("email not confirmed") ||
    normalizedMessage.includes("not confirmed")
  ) {
    return "E-posta doğrulaması gerekiyor.";
  }

  if (
    normalizedCode.includes("user_already_exists") ||
    normalizedMessage.includes("user already registered") ||
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already exists")
  ) {
    return "Bu e-posta zaten kayıtlı.";
  }

  if (normalizedMessage.includes("password")) {
    return "Şifre bilgisi geçersiz. Lütfen en az 8 karakter kullanın.";
  }

  if (normalizedMessage.includes("email")) {
    return "E-posta adresini kontrol edip tekrar deneyin.";
  }

  return "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
}

function getMetadataValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw new Error("Profil bilgileri kontrol edilemedi.");
  }

  if (existingProfile) {
    return existingProfile;
  }

  const emailName = user.email?.split("@")[0] ?? "kullanici";
  const metadataUsername = getMetadataValue(user.user_metadata.username);
  const metadataDisplayName = getMetadataValue(user.user_metadata.display_name);
  const username = metadataUsername || emailName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const displayName = metadataDisplayName || username;

  const { data: createdProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username,
      display_name: displayName
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error("Profil bilgileri oluşturulamadı.");
  }

  return createdProfile;
}

export async function getCurrentUserProfile(): Promise<AuthUserProfile | null> {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const metadataUsername = getMetadataValue(user.user_metadata.username);
  const metadataDisplayName = getMetadataValue(user.user_metadata.display_name);
  const emailName = user.email?.split("@")[0] ?? "kullanici";
  const username = profile?.username ?? metadataUsername ?? emailName;
  const displayName = profile?.display_name ?? metadataDisplayName ?? username;

  return {
    user,
    profile,
    username,
    displayName
  };
}

export async function signOutCurrentUser() {
  const supabase = getSupabaseClient();
  return supabase.auth.signOut();
}
