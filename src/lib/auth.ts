import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, type Database } from "@/lib/supabase";

export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export type AuthUserProfile = {
  user: User;
  profile: UserProfile | null;
  username: string;
  displayName: string;
};

export function getFriendlyAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı.";
  }

  if (normalizedMessage.includes("email not confirmed") || normalizedMessage.includes("not confirmed")) {
    return "E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanıza gelen doğrulama bağlantısına tıklayın.";
  }

  if (normalizedMessage.includes("user already registered") || normalizedMessage.includes("already registered")) {
    return "Bu e-posta adresiyle zaten bir hesap oluşturulmuş.";
  }

  if (normalizedMessage.includes("password")) {
    return "Şifre bilgisi geçersiz. Lütfen en az 8 karakter kullanın.";
  }

  if (normalizedMessage.includes("email")) {
    return "E-posta adresini kontrol edip tekrar deneyin.";
  }

  if (normalizedMessage.includes("network") || normalizedMessage.includes("fetch")) {
    return "Bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin.";
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
