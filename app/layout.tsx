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
  const isAdmin = await checkIsAdmin(supabase);

  const { data: categories } = await supabase.from("categories").select("id, name").order("name");
  const { data: procedureCategoryIds } = await supabase.from("procedures").select("category_id");

  const counts: Record<string, number> = {};
  procedureCategoryIds?.forEach((p) => {
    if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  });
  const totalCount = procedureCategoryIds?.length ?? 0;

  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <header className="border-b-2 border-accent bg-gradient-to-r from-header-blue to-ink">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-display font-semibold text-xl text-paper tracking-tight">The Prewitt Group</a>
            <div className="flex items-center gap-4">
              {isAdmin && <a href="/admin" className="text-sm text-paper hover:text-accent-soft">Admin</a>}
              {isAdmin && <a href="/procedures/new" className="text-sm text-paper hover:text-accent-soft border border-paper hover:border-accent-soft rounded px-3 py-1.5">+ Add procedure</a>}
              {user && <SignOutButton />}
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto md:flex md:items-start">
          <Suspense fallback={<div className="hidden md:block w-48 shrink-0" />}>
            <Sidebar categories={categories ?? []} counts={counts} totalCount={totalCount} />
          </Suspense>
          <main className="flex-1 min-w-0 px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
