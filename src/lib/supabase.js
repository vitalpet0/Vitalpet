// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (url && key) ? createClient(url, key) : null;

if (!url || !key) {
  console.warn("[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants (client désactivé)");
}
export default supabase;
