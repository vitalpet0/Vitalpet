// src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url  = import.meta.env.VITE_SUPABASE_URL;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY;

// si variables manquantes, on retourne null pour ne pas crasher
export const supabase = (url && key) ? createClient(url, key) : null;
