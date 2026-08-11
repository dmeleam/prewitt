import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/supabase/admin";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage() {
  const supabase = createClient();
  const isAdmin = await checkIsAdmin(supabase);

  if (!isAdmin) {
    return (
      <div>
        <h1 className="font-display text-xl font-semibold text-ink mb-2">Admins only</h1>
        <p className="text-sm text-ink-soft">You don't have admin access. Contact an admin if you think this is a mistake.</p>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: allowedEmails } = await supabase.from("allowed_emails").select("email, created_at").order("created_at", { ascending: false });
  const { data: adminRows } = await supabase.from("admins").select("user_id, profiles(email, full_name)").order("granted_at", { ascending: true });

  const admins = (adminRows ?? []).map((row: any) => ({
    user_id: row.user_id,
    email: row.profiles?.email ?? null,
    full_name: row.profiles?.full_name ?? "Unknown",
  }));

  return (
    <AdminPanel
      currentUserId={user!.id}
      allowedEmails={allowedEmails ?? []}
      admins={admins}
    />
  );
}
