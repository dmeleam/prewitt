"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_LINE } from "@/lib/images";

type Version = {
  id: string;
  content: string;
  edited_at: string;
  profiles: { full_name: string } | null;
};

type Category = { id: string; name: string };

type Props = {
  procedureId: string;
  title: string;
  content: string;
  categoryId: string | null;
  akaTerms: string | null;
  categories: Category[];
  versions: Version[];
  isAdmin: boolean;
  imageUrls: Record<string, string>;
};

function renderBody(content: string, imageUrls: Record<string, string>) {
  const lines = content.split("\n");
  const blocks: JSX.Element[] = [];
  let buffer: string[] = [];
  let key = 0;

  const flush = () => {
    if (buffer.length > 0) {
      blocks.push(<p key={key++} className="text-ink whitespace-pre-wrap leading-relaxed mb-4">{buffer.join("\n")}</p>);
      buffer = [];
    }
  };

  lines.forEach((line) => {
    const match = line.trim().match(IMAGE_LINE);
    if (match) {
      flush();
      const target = match[2];
      // Bare storage paths get a signed URL from the server; a full URL is
      // legacy content from before the bucket was made private.
      const src = imageUrls[target] ?? (/^https?:\/\//.test(target) ? target : null);

      if (src) {
        blocks.push(
          <a key={key++} href={src} target="_blank" rel="noopener noreferrer" className="block my-4">
            <img src={src} alt={match[1] || "Procedure screenshot"} className="rounded border border-line max-h-[420px] w-auto object-contain cursor-zoom-in hover:opacity-90" />
          </a>
        );
      } else {
        blocks.push(<p key={key++} className="text-sm text-ink-soft italic my-4">Screenshot unavailable.</p>);
      }
    } else {
      buffer.push(line);
    }
  });
  flush();
  return blocks;
}

export default function ProcedureEditor({ procedureId, title, content, categoryId, akaTerms, categories, versions, isAdmin, imageUrls }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [category, setCategory] = useState(categoryId ?? "");
  const [terms, setTerms] = useState(akaTerms ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const router = useRouter();

  function resetDraft() {
    setDraft(content);
    setCategory(categoryId ?? "");
    setTerms(akaTerms ?? "");
    setEditing(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${procedureId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("procedure-images").upload(path, file);
    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }
    // Store the bare storage path, not a URL — the bucket is private, so
    // a signed URL is generated fresh each time the page renders.
    setDraft((prev) => prev + `\n\n![Screenshot](${path})\n`);
    setUploading(false);
    e.target.value = "";
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error: versionError } = await supabase.from("procedure_versions").insert({ procedure_id: procedureId, content, edited_by: user?.id });
    const { error: updateError } = await supabase.from("procedures").update({
      content: draft,
      category_id: category || null,
      aka_terms: terms.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq("id", procedureId);

    setSaving(false);
    if (versionError || updateError) {
      alert("Save failed: " + (versionError?.message || updateError?.message));
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleRevert(versionContent: string) {
    if (!confirm("Revert to this version? This becomes the new current version.")) return;
    setDraft(versionContent);
    setEditing(true);
    setShowHistory(false);
  }

  async function handleDelete() {
    const confirmed = confirm(`Delete "${title}"? This permanently removes it and its full version history. This cannot be undone.`);
    if (!confirmed) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("procedures").delete().eq("id", procedureId);
    if (error) {
      alert("Delete failed: " + error.message);
      setDeleting(false);
      return;
    }
    router.push("/procedures");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {isAdmin && !editing && (
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={() => setEditing(true)} className="text-sm text-accent hover:underline">Edit</button>
            <button onClick={handleDelete} disabled={deleting} className="text-sm text-stamp hover:underline disabled:opacity-50">{deleting ? "Deleting..." : "Delete"}</button>
          </div>
        )}
      </div>

      {editing ? (
        <div>
          <label className="block text-sm text-ink-soft mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-line rounded px-3 py-2 text-sm bg-white mb-4">
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label className="block text-sm text-ink-soft mb-1">Alternate search terms</label>
          <input value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="e.g. NOC, non-renewal, cancellation letter" className="w-full border border-line rounded px-3 py-2 text-sm bg-white" />
          <p className="text-xs text-ink-soft mt-1 mb-4">Other words a coworker might search for instead of the title.</p>

          <label className="block text-sm text-ink-soft mb-1">Procedure</label>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={16} className="w-full border border-line rounded p-4 text-sm bg-white font-sans leading-relaxed" />

          <div className="flex items-center gap-3 mt-3">
            <label className="text-sm text-accent hover:underline cursor-pointer">
              {uploading ? "Uploading..." : "+ Add screenshot"}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
            <span className="text-xs text-ink-soft">Uploads and inserts the image into the text above.</span>
          </div>

          <div className="flex gap-3 mt-3">
            <button onClick={handleSave} disabled={saving} className="bg-accent text-paper rounded px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
            <button onClick={resetDraft} className="text-sm text-ink-soft hover:underline">Cancel</button>
          </div>
        </div>
      ) : (
        <div>{renderBody(content, imageUrls)}</div>
      )}

      <div className="mt-8 pt-6 border-t border-line">
        <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-ink-soft hover:text-ink">{showHistory ? "Hide" : "Show"} version history ({versions.length})</button>

        {showHistory && (
          <ul className="mt-3 space-y-2">
            {versions.length === 0 && <li className="text-sm text-ink-soft">No earlier versions — this is the original.</li>}
            {versions.map((v) => (
              <li key={v.id} className="text-sm border border-line rounded p-3 bg-white flex items-center justify-between gap-4">
                <span className="text-ink-soft">{v.profiles?.full_name ?? "Someone"} — {new Date(v.edited_at).toLocaleString()}</span>
                {isAdmin && <button onClick={() => handleRevert(v.content)} className="text-accent hover:underline shrink-0">Revert to this</button>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
