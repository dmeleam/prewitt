"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AllowedEmail = { email: string; created_at: string };
type AdminProfile = { user_id: string; email: string | null; full_name: string };

type Props = {
  currentUserId: string;
  allowedEmails: AllowedEmail[];
  admins: AdminProfile[];
};

export default function AdminPanel({ currentUserId, allowedEmails, admins }: Props) {
  const [newEmail, setNewEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const router = useRouter();

  async function handleAddEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setAddingEmail(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("allowed_emails").insert({ email: newEmail.trim().toLowerCase(), added_by: user?.id });
    setAddingEmail(false);
    if (error) {
      setEmailError(error.message);
      return;
    }
    setNewEmail("");
    router.refresh();
  }

  async function handleRemoveEmail(email: string) {
    if (!confirm(`Remove ${email} from the allow-list? They'll no longer be able to sign in.`)) return;
    const supabase = createClient();
    await supabase.from("allowed_emails").delete().eq("email", email);
    router.refresh();
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAdminError(null);
    setAddingAdmin(true);
    const supabase = createClient();

    const { data: profile, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", newAdminEmail.trim().toLowerCase())
      .maybeSingle();

    if (lookupError || !profile) {
      setAddingAdmin(false);
      setAdminError("No account found for that email. They need to sign in at least once first (add them to the allow-list above, then have them sign in).");
      return;
    }

    const { error: insertError } = await supabase.from("admins").insert({ user_id: profile.id });
    setAddingAdmin(false);
    if (insertError) {
      setAdminError(insertError.message);
      return;
    }
    setNewAdminEmail("");
    router.refresh();
  }

  async function handleRemoveAdmin(userId: string, email: string | null) {
    if (admins.length <= 1) {
      alert("You can't remove the last admin — that would lock everyone out of admin access.");
      return;
    }
    if (!confirm(`Remove admin access for ${email ?? "this user"}?`)) return;
    const supabase = createClient();
    await supabase.from("admins").delete().eq("user_id", userId);
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Admin</h1>
        <p className="text-sm text-ink-soft">Manage who can sign in and who has admin access.</p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-2">Allowed to sign in</h2>
        <p className="text-sm text-ink-soft mb-3">Only these email addresses can sign in at all.</p>

        <form onSubmit={handleAddEmail} className="flex gap-2 mb-4">
          <input type="email" required placeholder="newperson@agency.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="flex-1 border border-line rounded px-3 py-2 text-sm bg-white" />
          <button type="submit" disabled={addingEmail} className="bg-accent text-paper rounded px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">{addingEmail ? "Adding..." : "Add"}</button>
        </form>
        {emailError && <p className="text-sm text-stamp mb-3">{emailError}</p>}

        <ul className="space-y-2">
          {allowedEmails.length === 0 && <li className="text-sm text-ink-soft">No allowed emails yet.</li>}
          {allowedEmails.map((e) => (
            <li key={e.email} className="text-sm border border-line rounded p-3 bg-white flex items-center justify-between gap-4">
              <span>{e.email}</span>
              <button onClick={() => handleRemoveEmail(e.email)} className="text-stamp hover:underline shrink-0">Remove</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-2">Admins</h2>
        <p className="text-sm text-ink-soft mb-3">Admins can add, edit, and delete procedures, and manage this page. The person must have signed in at least once before you can grant them admin.</p>

        <form onSubmit={handleAddAdmin} className="flex gap-2 mb-4">
          <input type="email" required placeholder="existing user's email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="flex-1 border border-line rounded px-3 py-2 text-sm bg-white" />
          <button type="submit" disabled={addingAdmin} className="bg-accent text-paper rounded px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">{addingAdmin ? "Adding..." : "Grant admin"}</button>
        </form>
        {adminError && <p className="text-sm text-stamp mb-3">{adminError}</p>}

        <ul className="space-y-2">
          {admins.map((a) => (
            <li key={a.user_id} className="text-sm border border-line rounded p-3 bg-white flex items-center justify-between gap-4">
              <span>{a.full_name} {a.email ? `(${a.email})` : ""} {a.user_id === currentUserId ? "· you" : ""}</span>
              <button onClick={() => handleRemoveAdmin(a.user_id, a.email)} className="text-stamp hover:underline shrink-0">Revoke</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
