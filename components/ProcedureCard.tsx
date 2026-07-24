type Props = {
  id: string;
  title: string;
  categoryName: string | null;
  snippet: string;
  updatedAt: string;
};

export default function ProcedureCard({
  id,
  title,
  categoryName,
  snippet,
  updatedAt,
}: Props) {
  return (
    <a
      href={`/procedures/${id}`}
      className="block border border-line rounded p-4 bg-white hover:border-accent transition-colors"
    >
      <div className="flex items-center justify-between gap-4 mb-1">
        <h3 className="font-medium text-ink">{title}</h3>
        {categoryName && (
          <span className="text-xs shrink-0 bg-accent-soft text-accent px-2 py-0.5 rounded">
            {categoryName}
          </span>
        )}
      </div>
      <p className="text-sm text-ink-soft line-clamp-2">{snippet}</p>
      <p className="text-xs text-ink-soft mt-2">
        Updated {new Date(updatedAt).toLocaleDateString()}
      </p>
    </a>
  );
}
