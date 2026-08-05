import { createClient } from "@/lib/supabase/server";
import SearchBar from "@/components/SearchBar";
import ProcedureCard from "@/components/ProcedureCard";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function HomePage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const q = searchParams.q ?? "";
  const categorySlug = searchParams.category ?? "";
  const supabase = createClient();

  if (q) {
    const { data: procedures, error } = await supabase
      .from("procedures")
      .select("id, title, content, updated_at, categories(name)")
      .textSearch("search_vector", q, { type: "websearch" })
      .limit(20);

    return (
      <div>
        <SearchBar initialValue={q} />
        {error && <p className="text-sm text-stamp mt-4">Couldn't load procedures: {error.message}</p>}
        <div className="mt-6 space-y-3">
          {procedures && procedures.length === 0 && (
            <p className="text-sm text-ink-soft">No procedures matched "{q}". Try different words, or add it yourself.</p>
          )}
          {procedures?.map((p: any) => (
            <ProcedureCard key={p.id} id={p.id} title={p.title} categoryName={p.categories?.name ?? null} snippet={p.content.slice(0, 160)} updatedAt={p.updated_at} />
          ))}
        </div>
      </div>
    );
  }

  if (categorySlug) {
    const { data: allCategories } = await supabase.from("categories").select("id, name");
    const match = allCategories?.find((c) => slugify(c.name) === categorySlug);

    if (!match) {
      return (
        <div>
          <SearchBar initialValue={q} />
          <p className="text-sm text-ink-soft mt-6">Category not found. <a href="/" className="text-accent hover:underline">Back to all categories</a></p>
        </div>
      );
    }

    const { data: procedures, error } = await supabase
      .from("procedures")
      .select("id, title, content, updated_at, categories(name)")
      .eq("category_id", match.id)
      .order("title", { ascending: true });

    return (
      <div>
        <SearchBar initialValue={q} />
        <div className="mt-6 mb-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold text-ink">{match.name}</h1>
          <a href="/" className="text-sm text-accent hover:underline">All categories</a>
        </div>
        {error && <p className="text-sm text-stamp">Couldn't load procedures: {error.message}</p>}
        <div className="space-y-3">
          {procedures && procedures.length === 0 && <p className="text-sm text-ink-soft">No procedures in this category yet.</p>}
          {procedures?.map((p: any) => (
            <ProcedureCard key={p.id} id={p.id} title={p.title} categoryName={p.categories?.name ?? null} snippet={p.content.slice(0, 160)} updatedAt={p.updated_at} />
          ))}
        </div>
      </div>
    );
  }

  const { data: recent } = await supabase
    .from("procedures")
    .select("id, title, content, updated_at, categories(name)")
    .order("updated_at", { ascending: false })
    .limit(6);

  return (
    <div>
      <SearchBar initialValue={q} />
      <p className="text-xs text-ink-soft uppercase tracking-wide mt-8 mb-3">Recently updated</p>
      <div className="space-y-3">
        {recent && recent.length === 0 && (
          <p className="text-sm text-ink-soft">No procedures yet. Pick a category from the sidebar or add the first one.</p>
        )}
        {recent?.map((p: any) => (
          <ProcedureCard key={p.id} id={p.id} title={p.title} categoryName={p.categories?.name ?? null} snippet={p.content.slice(0, 160)} updatedAt={p.updated_at} />
        ))}
      </div>
    </div>
  );
}
