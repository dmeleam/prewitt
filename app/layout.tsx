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
        <header className="border-b border-line bg-paper">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="The Prewitt Group" className="h-14 w-auto" />
              <span className="font-display font-semibold text-lg text-ink hidden sm:inline">Procedures</span>
            </a>
            <a href="/procedures/new" className="text-sm text-accent hover:underline">+ Add procedure</a>
          </div>
        </header>

        <div className="border-b border-line bg-white">
          <nav className="max-w-3xl mx-auto px-6 py-2 flex items-center gap-x-4 gap-y-1 flex-wrap text-sm">
            <a href="/" className="text-ink-soft hover:text-accent font-medium">All procedures</a>
            {categories?.map((c) => (
              <a key={c.name} href={`/#${slugify(c.name)}`} className="text-ink-soft hover:text-accent">{c.name}</a>
            ))}
          </nav>
        </div>

        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
