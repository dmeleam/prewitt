"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  categories: Category[];
  versions: Version[];
};

export default function ProcedureEditor({ procedureId, title, content, categoryId, categories, versions }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [category, setCategory] = useState(categoryId ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("procedure_versions").insert({ procedure_id: procedureId, content, edited_by: user?.id });
    await supabase.from("procedures").update({
      content: draft,
      category_id: category || null,
      updated_at: new Date().toISOString(),
    }).eq("id", procedureId);

    setSaving(false);
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
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {!editing && (
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

          <label className="block text-sm text-ink-soft mb-1">Procedure</label>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={16} className="w-full border border-line rounded p-4 text-sm bg-white font-sans leading-relaxed" />

          <div className="flex gap-3 mt-3">
            <button onClick={handleSave} disabled={saving} className="bg-accent text-paper rounded px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
            <button onClick={() => { setDraft(content); setCategory(categoryId ?? ""); setEditing(false); }} className="text-sm text-ink-soft hover:underline">Cancel</button>
          </div>
        </div>
      ) : (
        <p className="text-ink whitespace-pre-wrap leading-relaxed">{content}</p>
      )}

      <div className="mt-8 pt-6 border-t border-line">
        <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-ink-soft hover:text-ink">{showHistory ? "Hide" : "Show"} version history ({versions.length})</button>

        {showHistory && (
          <ul className="mt-3 space-y-2">
            {versions.length === 0 && <li className="text-sm text-ink-soft">No earlier versions — this is the original.</li>}
            {versions.map((v) => (
              <li key={v.id} className="text-sm border border-line rounded p-3 bg-white flex items-center justify-between gap-4">
                <span className="text-ink-soft">{v.profiles?.full_name ?? "Someone"} — {new Date(v.edited_at).toLocaleString()}</span>
                <button onClick={() => handleRevert(v.content)} className="text-accent hover:underline shrink-0">Revert to this</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
