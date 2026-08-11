type Props = {
  id: string;
  title: string;
  categoryName: string | null;
  snippet: string;
  updatedAt: string;
};

// Procedure content can contain screenshot lines like ![Screenshot](https://...).
// Those are useless in a preview, so strip them out before truncating —
// otherwise a procedure that opens with a screenshot shows a raw URL as its snippet.
function toPreview(content: string, maxLength = 160) {
  const cleaned = content
    .split("\n")
    .filter((line) => !/^!\[[^\]]*\]\([^)]*\)\s*$/.test(line.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trimEnd() + "...";
}

export default function ProcedureCard({ id, title, categoryName, snippet, updatedAt }: Props) {
  const preview = toPreview(snippet);

  return (
    <a href={`/procedures/${id}`} className="block border border-line rounded p-4 bg-white hover:border-accent transition-colors">
      <div className="flex items-center justify-between gap-4 mb-1">
        <h3 className="font-medium text-ink">{title}</h3>
        {categoryName && <span className="text-xs shrink-0 bg-accent-soft text-accent px-2 py-0.5 rounded">{categoryName}</span>}
      </div>
      {preview && <p className="text-sm text-ink-soft line-clamp-2">{preview}</p>}
      <p className="text-xs text-ink-soft mt-2">Updated {new Date(updatedAt).toLocaleDateString()}</p>
    </a>
  );
}
