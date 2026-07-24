# Agency Procedures

A searchable, editable procedures library for the agency. Anyone signed in can search, read, add, and edit procedures. Every edit is saved as a version, so nothing is ever permanently lost.

## What's here

- `lib/supabase/schema.sql` — the database tables (run this once in Supabase)
- `app/page.tsx` — home page: search box + results
- `app/procedures/[id]/page.tsx` — read a procedure, edit it, view/revert history
- `app/procedures/new/page.tsx` — add a new procedure
- `app/login/page.tsx` — email magic-link sign-in (no passwords to manage)

## Set up your own copy (about 15 minutes)

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New project (free tier is plenty for this). Once it's created:
- Go to **SQL Editor** → paste in the contents of `lib/supabase/schema.sql` → Run
- Go to **Project Settings → API** → copy the **Project URL** and **anon public key**

### 2. Add a profiles trigger (so signing in auto-creates a profile row)
In the SQL Editor, run:
```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3. Turn on email sign-in
In Supabase: **Authentication → Providers → Email** — should be on by default. For a real launch, also set up a custom SMTP sender under **Authentication → Email Templates** so magic links don't land in spam (Supabase's default sender is rate-limited and fine for testing only).

### 4. Configure this project
```bash
cp .env.local.example .env.local
# paste in your Project URL and anon key
npm install
npm run dev
```
Visit `http://localhost:3000` — you'll be redirected to `/login`.

### 5. Deploy so the whole agency can use it
Push this folder to a GitHub repo, then import it at [vercel.com/new](https://vercel.com/new). Add the same two environment variables in Vercel's project settings. Once deployed, share the URL — that's the whole distribution story, no installers needed.

## What's intentionally not built yet
- Onboarding checklists (the `onboarding_steps` / `user_progress` tables exist in the schema but there's no UI for them yet)
- Category management UI (categories are seeded in SQL; add an admin page if you want to manage them in-app)
- Rich text formatting (procedures are stored as plain text — swap the `<textarea>` for a lightweight markdown editor like `@uiw/react-md-editor` if you want formatting)

## A note on the "anyone can edit" model
There's no approval workflow by design — that was the ask. The safety net is version history: every save on a procedure records what it replaced, and any version can be restored from the procedure page. If this ever needs tighter control (e.g. only certain roles can edit compliance-sensitive procedures), that's a change to the Row Level Security policies in `schema.sql`, not a rewrite.
