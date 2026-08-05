import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Prewitt Group — Procedures",
  description: "Searchable procedures and onboarding for The Prewitt Group",
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("name");

  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <header className="border-b-2 border-accent bg-gradient-to-r from-header-blue to-ink">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-display font-semibold text-xl text-paper tracking-tight">The Prewitt Group</a>
            <a href="/procedures/new" className="text-sm text-paper hover:text-accent-soft border border-paper hover:border-accent-soft rounded px-3 py-1.5">+ Add procedure</a>
          </div>
        </header>

        <div className="max-w-5xl mx-auto flex items-start">
          <aside className="w-48 shrink-0 border-r border-line px-4 py-8 sticky top-0">
            <p className="text-xs text-ink-soft uppercase tracking-wide mb-3">Categories</p>
            <nav className="flex flex-col gap-1">
              <a href="/" className="text-sm rounded px-2 py-1.5 bg-accent-soft text-accent font-medium">All procedures</a>
              {categories?.map((c) => (
                <a key={c.id} href={`/?category=${slugify(c.name)}`} className="text-sm rounded px-2 py-1.5 text-ink-soft hover:bg-accent-soft hover:text-accent">{c.name}</a>
              ))}
            </nav>
          </aside>
          <main className="flex-1 min-w-0 px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
