import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/supabase/admin";
import Sidebar from "@/components/Sidebar";
import SignOutButton from "@/components/SignOutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Prewitt Group — Procedures",
  description: "Searchable procedures and onboarding for The Prewitt Group",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Everything below is only fetched and rendered for signed-in users.
  // Signed out, the page is just the header and the login form.
  const isAdmin = user ? await checkIsAdmin(supabase) : false;

  let categories: { id: string; name: string }[] = [];
  const counts: Record<string, number> = {};
  let totalCount = 0;

  if (user) {
    const { data: categoryRows } = await supabase.from("categories").select("id, name").order("name");
    const { data: procedureCategoryIds } = await supabase.from("procedures").select("category_id");

    categories = categoryRows ?? [];
    procedureCategoryIds?.forEach((p) => {
      if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
    });
    totalCount = procedureCategoryIds?.length ?? 0;
  }

  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <header className="border-b-2 border-accent bg-gradient-to-r from-header-blue to-ink">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <a href="/" className="font-display font-semibold text-xl text-paper tracking-tight">The Prewitt Group</a>

            {user && (
              <div className="flex items-center gap-5">
                {isAdmin && (
                  <>
                    <a href="/procedures/new" className="text-sm text-ink bg-paper hover:bg-accent-soft rounded px-3 py-1.5 font-medium">+ Add procedure</a>
                    <a href="/admin" className="text-sm text-paper/80 hover:text-paper">Admin</a>
                  </>
                )}
                <span className="h-4 w-px bg-paper/25" aria-hidden="true" />
                <SignOutButton />
              </div>
            )}
          </div>
        </header>

        <div className="max-w-5xl mx-auto md:flex md:items-start">
          {user && (
            <Suspense fallback={<div className="hidden md:block w-48 shrink-0" />}>
              <Sidebar categories={categories} counts={counts} totalCount={totalCount} />
            </Suspense>
          )}
          <main className="flex-1 min-w-0 px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
