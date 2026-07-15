-- ============================================================================
-- Yasso Store — remove the admin email allow-list from is_admin()
-- The database used to gate admin access by a hardcoded list of emails inside
-- is_admin(). That is removed: ANY authenticated Supabase Auth user is now an
-- admin. Access is governed entirely by who has a Supabase account — so keep
-- public sign-ups disabled in the Supabase dashboard.
--
-- This mirrors the app-side change (src/lib/auth/session.ts + middleware),
-- which also no longer checks any email allow-list. Every admin_* RPC, the
-- Storage write policies and the RLS checks all call is_admin(), so they keep
-- working unchanged for any authenticated user.
--
-- Apply with the Supabase SQL Editor (paste & run) or `supabase db push`.
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null;
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Make PostgREST pick up the change immediately.
notify pgrst, 'reload schema';
