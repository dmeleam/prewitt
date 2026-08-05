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
  const { data: categories } = await supabase.from("categories").select("name").order("name");

  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <header className="border-b-2 border-accent bg-ink">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-display font-semibold text-xl text-paper tracking-tight">The Prewitt Group</a>
            <a href="/procedures/new" className="text-sm text-paper hover:text-accent-soft border border-paper hover:border-accent-soft rounded px-3 py-1.5">+ Add procedure</a>
          </div>
        </header>

        <div className="border-b border-line bg-accent-soft">
          <nav className="max-w-3xl mx-auto px-6 py-2 flex items-center gap-x-4 gap-y-1 flex-wrap text-sm">
            <a href="/" className="text-accent hover:underline font-semibold">All procedures</a>
            {categories?.map((c) => (
              <a key={c.name} href={`/?category=${slugify(c.name)}`} className="text-ink-soft hover:text-accent">{c.name}</a>
            ))}
          </nav>
        </div>

        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
