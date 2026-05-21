import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string | null;
          avatar_url: string | null;
          is_admin: boolean | null;
          social_links: Json | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          bio?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean | null;
          social_links?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean | null;
          social_links?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          category_slug: string | null;
          subcategory_slug: string | null;
          title: string;
          slug: string;
          short_description: string;
          description: string;
          price: number | null;
          is_free: boolean;
          status: "pending" | "approved" | "rejected";
          thumbnail_url: string | null;
          demo_url: string | null;
          youtube_url: string | null;
          tags: string[] | null;
          tech_stack: string[] | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          category_slug?: string | null;
          subcategory_slug?: string | null;
          title: string;
          slug: string;
          short_description: string;
          description: string;
          price?: number | null;
          is_free: boolean;
          status?: "pending" | "approved" | "rejected";
          thumbnail_url?: string | null;
          demo_url?: string | null;
          youtube_url?: string | null;
          tags?: string[] | null;
          tech_stack?: string[] | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          category_slug?: string | null;
          subcategory_slug?: string | null;
          title?: string;
          slug?: string;
          short_description?: string;
          description?: string;
          price?: number | null;
          is_free?: boolean;
          status?: "pending" | "approved" | "rejected";
          thumbnail_url?: string | null;
          demo_url?: string | null;
          youtube_url?: string | null;
          tags?: string[] | null;
          tech_stack?: string[] | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          listing_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          listing_id?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          listing_id?: string | null;
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "listing_approved" | "listing_rejected" | "new_message" | "new_favorite";
          title: string;
          body: string;
          link_url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "listing_approved" | "listing_rejected" | "new_message" | "new_favorite";
          title: string;
          body: string;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "listing_approved" | "listing_rejected" | "new_message" | "new_favorite";
          title?: string;
          body?: string;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type AppSupabaseClient = SupabaseClient<Database, "public", "public">;

let browserClient: AppSupabaseClient | undefined;

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missingEnv: string[] = [];

  if (!supabaseUrl) {
    missingEnv.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    missingEnv.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Supabase ortam değişkenleri eksik: ${missingEnv.join(
        ", "
      )}. Lütfen .env.local dosyasına NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini ekleyin.`
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey
  };
}

function createSupabaseClient(): AppSupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createClient<Database, "public">(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
      detectSessionInUrl: typeof window !== "undefined"
    }
  });
}

export function getSupabaseClient(): AppSupabaseClient {
  if (typeof window === "undefined") {
    return createSupabaseClient();
  }

  browserClient ??= createSupabaseClient();
  return browserClient;
}

export const supabase = getSupabaseClient();
