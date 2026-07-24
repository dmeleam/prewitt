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

type Props = {
  procedureId: string;
  title: string;
  content: string;
  versions: Version[];
};

export default function ProcedureEditor({
  procedureId,
  title,
  content,
  versions,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Record the version BEING REPLACED before overwriting, so history
    // always holds what was true at each point in time.
    await supabase.from("procedure_versions").insert({
      procedure_id: procedureId,
      content,
      edited_by: user?.id,
    });

    await supabase
      .from("procedures")
      .update({ content: draft, updated_at: new Date().toISOString() })
      .eq("id", procedureId);

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

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {title}
        </h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-accent hover:underline shrink-0"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={16}
            className="w-full border border-line rounded p-4 text-sm bg-white font-sans leading-relaxed"
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-ink text-paper rounded px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              onClick={() => {
                setDraft(content);
                setEditing(false);
              }}
              className="text-sm text-ink-soft hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-ink whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      )}

      <div className="mt-8 pt-6 border-t border-line">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-ink-soft hover:text-ink"
        >
          {showHistory ? "Hide" : "Show"} version history ({versions.length})
        </button>

        {showHistory && (
          <ul className="mt-3 space-y-2">
            {versions.length === 0 && (
              <li className="text-sm text-ink-soft">
                No earlier versions — this is the original.
              </li>
            )}
            {versions.map((v) => (
              <li
                key={v.id}
                className="text-sm border border-line rounded p-3 bg-white flex items-center justify-between gap-4"
              >
                <span className="text-ink-soft">
                  {v.profiles?.full_name ?? "Someone"} —{" "}
                  {new Date(v.edited_at).toLocaleString()}
                </span>
                <button
                  onClick={() => handleRevert(v.content)}
                  className="text-accent hover:underline shrink-0"
                >
                  Revert to this
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
