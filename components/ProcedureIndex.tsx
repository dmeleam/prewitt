type Procedure = { id: string; title: string };
type Group = { categoryName: string; slug: string; procedures: Procedure[] };

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function ProcedureIndex({ groups }: { groups: Group[] }) {
  if (groups.length === 0) {
    return <p className="text-sm text-ink-soft mt-6">No procedures yet — add the first one.</p>;
  }

  return (
    <div className="mt-8">
      <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-b border-line pb-4 mb-6">
        {groups.map((g) => (
          <a key={g.slug} href={`#${g.slug}`} className="text-accent hover:underline">{g.categoryName} ({g.procedures.length})</a>
        ))}
      </nav>

      {groups.map((g) => (
        <div key={g.slug} className="mb-8">
          <h2 id={g.slug} className="font-display text-lg font-semibold text-ink mb-2 scroll-mt-4">{g.categoryName}</h2>
          <ul className="space-y-1">
            {g.procedures.map((p) => (
              <li key={p.id}><a href={`/procedures/${p.id}`} className="text-sm text-ink hover:text-accent">{p.title}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
