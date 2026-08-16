import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      const { data: isAllowed } = await supabase.rpc("is_email_allowed", { check_email: data.user.email });

      if (!isAllowed) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=not_authorized`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
