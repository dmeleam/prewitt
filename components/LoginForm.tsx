"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const rejected = searchParams.get("error") === "not_authorized";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();

    const { data: isAllowed } = await supabase.rpc("is_email_allowed", { check_email: email.trim().toLowerCase() });
    if (!isAllowed) {
      setError("This email isn't authorized to sign in. Contact an admin to be added.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <>
      {rejected && (
        <p className="text-sm bg-stamp/10 text-stamp rounded p-4 mb-4">That email isn't authorized to sign in. Contact an admin to be added.</p>
      )}

      {sent ? (
        <p className="text-sm bg-accent-soft text-accent rounded p-4">Check your inbox for a sign-in link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" required placeholder="you@agency.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line rounded px-3 py-2 text-sm bg-white" />
          <button type="submit" className="w-full bg-accent text-paper rounded px-3 py-2 text-sm font-medium hover:opacity-90">Send sign-in link</button>
          {error && <p className="text-sm text-stamp">{error}</p>}
        </form>
      )}
    </>
  );
}
