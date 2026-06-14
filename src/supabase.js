import { createClient } from "@supabase/supabase-js";

// Public client config. The anon key is meant to be public (RLS guards data),
// so it's fine that these VITE_* values ship in the browser bundle.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// When unset, the app runs on in-memory seed data (no persistence).
export const dbEnabled = Boolean(url && anonKey);

export const supabase = dbEnabled ? createClient(url, anonKey) : null;
