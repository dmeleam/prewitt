import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Prewitt Group — Procedures",
  description: "Searchable procedures and onboarding for The Prewitt Group",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <header className="border-b-2 border-accent bg-header-blue">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-display font-semibold text-xl text-paper tracking-tight">The Prewitt Group</a>
            <a href="/procedures/new" className="text-sm text-paper hover:text-accent-soft border border-paper hover:border-accent-soft rounded px-3 py-1.5">+ Add procedure</a>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
