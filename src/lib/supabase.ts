import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isValidUrl = (url: string) => {
  try {
    return url.startsWith("https://") && !url.includes("your-supabase-url");
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = () => {
  return isValidUrl(rawUrl) && Boolean(rawKey && !rawKey.includes("your-supabase"));
};

export const supabase = createClient(
  isValidUrl(rawUrl) ? rawUrl : "https://placeholder.supabase.co",
  rawKey && !rawKey.includes("your-supabase") ? rawKey : "placeholder-anon-key"
);
