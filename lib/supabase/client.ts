import { createBrowserClient } from "@supabase/ssr";

// Used inside components marked "use client" — search box, edit form, etc.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
