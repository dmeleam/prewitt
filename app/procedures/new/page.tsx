import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/supabase/admin";
import NewProcedureForm from "@/components/NewProcedureForm";

export default async function NewProcedurePage() {
  const supabase = await createClient();
  const isAdmin = await checkIsAdmin(supabase);

  if (!isAdmin) {
    return (
      <div>
        <h1 className="font-display text-xl font-semibold text-ink mb-2">Admins only</h1>
        <p className="text-sm text-ink-soft">Only admins can add new procedures. Contact an admin if you think this is a mistake.</p>
      </div>
    );
  }

  return <NewProcedureForm />;
}
