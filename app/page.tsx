import { createClient } from "@/lib/supabase/server";
import SearchBar from "@/components/SearchBar";
import ProcedureCard from "@/components/ProcedureCard";
import ProcedureIndex from "@/components/ProcedureIndex";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function HomePage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ?? "";
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

  const { data: procedures, error } = await supabase
    .from("procedures")
    .select("id, title, categories(name)")
    .order("title", { ascending: true });

  const groupMap = new Map<string, { id: string; title: string }[]>();
  procedures?.forEach((p: any) => {
    const name = p.categories?.name ?? "Uncategorized";
    if (!groupMap.has(name)) groupMap.set(name, []);
    groupMap.get(name)!.push({ id: p.id, title: p.title });
  });

  const groups = Array.from(groupMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([categoryName, procs]) => ({ categoryName, slug: slugify(categoryName), procedures: procs }));

  return (
    <div>
      <SearchBar initialValue={q} />
      {error && <p className="text-sm text-stamp mt-4">Couldn't load procedures: {error.message}</p>}
      <ProcedureIndex groups={groups} />
    </div>
  );
}
