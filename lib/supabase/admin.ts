import { SupabaseClient } from "@supabase/supabase-js";

// Checks admin status the same way everywhere it's needed: server components,
// route handlers, etc. This is a UI convenience only — the real enforcement
// is the RLS policies on the admins/procedures/categories tables, which
// block writes even if this check were somehow bypassed.
export async function checkIsAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return !!data;
}
