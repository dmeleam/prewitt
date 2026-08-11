import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Shape of the cookies Supabase hands back for us to write.
// `options` is loosely typed because Next's cookie options and Supabase's
// differ slightly between versions; this keeps the build stable either way.
type CookieToSet = { name: string; value: string; options?: any };

// Used inside server components and route handlers — pages that fetch
// data before the page ever reaches the browser.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
            // because middleware handles session refresh instead.
          }
        },
      },
    }
  );
}
