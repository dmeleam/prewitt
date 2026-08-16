import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/supabase/admin";
import { buildSignedUrlMap } from "@/lib/images";
import ProcedureEditor from "@/components/ProcedureEditor";
import { notFound } from "next/navigation";

export default async function ProcedurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const isAdmin = await checkIsAdmin(supabase);

  const { data: procedure } = await supabase
    .from("procedures")
    .select("id, title, content, category_id, aka_terms")
    .eq("id", id)
    .single();

  if (!procedure) notFound();

  const { data: versions } = await supabase
    .from("procedure_versions")
    .select("id, content, edited_at, profiles(full_name)")
    .eq("procedure_id", id)
    .order("edited_at", { ascending: false });

  const { data: categories } = await supabase.from("categories").select("id, name").order("name");

  const imageUrls = await buildSignedUrlMap(supabase, procedure.content);

  return (
    <ProcedureEditor
      procedureId={procedure.id}
      title={procedure.title}
      content={procedure.content}
      categoryId={procedure.category_id}
      akaTerms={procedure.aka_terms}
      categories={categories ?? []}
      versions={(versions as any) ?? []}
      isAdmin={isAdmin}
      imageUrls={imageUrls}
    />
  );
}
