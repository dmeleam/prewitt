import { createClient } from "@/lib/supabase/server";
import ProcedureCard from "@/components/ProcedureCard";

export default async function AllProceduresPage() {
  const supabase = createClient();

  const { data: procedures, error } = await supabase
    .from("procedures")
    .select("id, title, content, updated_at, categories(name)")
    .order("title", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-4">All procedures {procedures ? `(${procedures.length})` : ""}</h1>
      {error && <p className="text-sm text-stamp">Couldn't load procedures: {error.message}</p>}
      <div className="space-y-3">
        {procedures && procedures.length === 0 && <p className="text-sm text-ink-soft">No procedures yet.</p>}
        {procedures?.map((p: any) => (
          <ProcedureCard key={p.id} id={p.id} title={p.title} categoryName={p.categories?.name ?? null} snippet={p.content.slice(0, 160)} updatedAt={p.updated_at} />
        ))}
      </div>
    </div>
  );
}
