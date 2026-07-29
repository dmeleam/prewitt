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
        <header className="border-b border-line bg-paper">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="The Prewitt Group" className="h-12 w-auto" />
              <span className="font-display font-semibold text-lg text-ink hidden sm:inline">Procedures</span>
            </a>
            <a href="/procedures/new" className="text-sm text-accent hover:underline">+ Add procedure</a>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
