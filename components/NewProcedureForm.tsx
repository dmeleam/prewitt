"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string };

export default function NewProcedureForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [akaTerms, setAkaTerms] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categories").select("id, name").order("name").then(({ data }) => setCategories(data ?? []));
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `new/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("procedure-images").upload(path, file);
    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("procedure-images").getPublicUrl(path);
    setContent((prev) => prev + `\n\n![Screenshot](${data.publicUrl})\n`);
    setUploading(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("procedures")
      .insert({
        title,
        content,
        aka_terms: akaTerms || null,
        category_id: categoryId || null,
        created_by: user?.id,
      })
      .select("id")
      .single();

    setSaving(false);
    if (error) {
      alert("Save failed: " + error.message);
      return;
    }
    if (data) {
      router.push(`/procedures/${data.id}`);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Add a procedure</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-ink-soft mb-1">Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 30 day notice of cancellation" className="w-full border border-line rounded px-3 py-2 text-sm bg-white" />
        </div>

        <div>
          <label className="block text-sm text-ink-soft mb-1">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-line rounded px-3 py-2 text-sm bg-white">
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-ink-soft mb-1">Alternate search terms</label>
          <input value={akaTerms} onChange={(e) => setAkaTerms(e.target.value)} placeholder="e.g. NOC, non-renewal, cancellation letter" className="w-full border border-line rounded px-3 py-2 text-sm bg-white" />
          <p className="text-xs text-ink-soft mt-1">Other words a coworker might search for instead of the title.</p>
        </div>

        <div>
          <label className="block text-sm text-ink-soft mb-1">Procedure</label>
          <textarea required rows={14} value={content} onChange={(e) => setContent(e.target.value)} className="w-full border border-line rounded p-4 text-sm bg-white leading-relaxed" />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-accent hover:underline cursor-pointer">
            {uploading ? "Uploading..." : "+ Add screenshot"}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
          </label>
          <span className="text-xs text-ink-soft">Uploads and inserts the image into the text above.</span>
        </div>

        <button type="submit" disabled={saving} className="bg-accent text-paper rounded px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Save procedure"}</button>
      </form>
    </div>
  );
}
