import { createClient } from "@/lib/supabase/server";
import SearchBar from "@/components/SearchBar";
import ProcedureCard from "@/components/ProcedureCard";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";
  const supabase = createClient();

  let query = supabase
    .from("procedures")
    .select("id, title, content, updated_at, categories(name)")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (q) {
    // websearch_to_tsquery handles natural phrases like "30 day cancellation notice"
    // without the user needing to know Postgres search syntax
    query = supabase
      .from("procedures")
      .select("id, title, content, updated_at, categories(name)")
      .textSearch("search_vector", q, { type: "websearch" })
      .limit(20);
  }

  const { data: procedures, error } = await query;

  return (
    <div>
      <SearchBar initialValue={q} />

      {error && (
        <p className="text-sm text-stamp mt-4">
          Couldn't load procedures: {error.message}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {procedures && procedures.length === 0 && (
          <p className="text-sm text-ink-soft">
            {q
              ? `No procedures matched "${q}". Try different words, or add it yourself.`
              : "No procedures yet — add the first one."}
          </p>
        )}

        {procedures?.map((p: any) => (
          <ProcedureCard
            key={p.id}
            id={p.id}
            title={p.title}
            categoryName={p.categories?.name ?? null}
            snippet={p.content.slice(0, 160)}
            updatedAt={p.updated_at}
          />
        ))}
      </div>
    </div>
  );
}
