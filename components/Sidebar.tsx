"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

type Category = { id: string; name: string };

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

type Props = {
  categories: Category[];
  counts: Record<string, number>;
  totalCount: number;
};

export default function Sidebar({ categories, counts, totalCount }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const isAllProcedures = pathname === "/procedures";
  const [open, setOpen] = useState(false);

  function linkClass(active: boolean) {
    return active
      ? "flex items-center justify-between text-sm rounded px-2 py-1.5 bg-accent-soft text-accent font-medium"
      : "flex items-center justify-between text-sm rounded px-2 py-1.5 text-ink-soft hover:bg-accent-soft hover:text-accent";
  }

  function renderLinks() {
    return (
      <>
        <a href="/procedures" className={linkClass(isAllProcedures)}>
          <span>All procedures</span>
          <span className="text-xs text-ink-soft">{totalCount}</span>
        </a>
        {categories.map((c) => (
          <a key={c.id} href={`/?category=${slugify(c.name)}`} className={linkClass(activeCategory === slugify(c.name))}>
            <span>{c.name}</span>
            <span className="text-xs text-ink-soft">{counts[c.id] ?? 0}</span>
          </a>
        ))}
      </>
    );
  }

  return (
    <>
      <div className="md:hidden border-b border-line px-6 py-2">
        <button onClick={() => setOpen(!open)} className="text-sm text-accent font-medium">{open ? "Hide categories" : "Categories"}</button>
        {open && <nav className="flex flex-col gap-1 mt-2 pb-2">{renderLinks()}</nav>}
      </div>

      <aside className="hidden md:block w-48 shrink-0 border-r border-line px-4 py-8 sticky top-0">
        <p className="text-xs text-ink-soft uppercase tracking-wide mb-3">Categories</p>
        <nav className="flex flex-col gap-1">{renderLinks()}</nav>
      </aside>
    </>
  );
}
