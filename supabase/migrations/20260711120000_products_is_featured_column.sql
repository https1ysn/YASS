-- ============================================================================
-- Yasso Store — repair: products.is_featured column
--
-- Diagnosis: creating/saving a product from /admin/products fails with
--   "column \"is_featured\" of relation \"products\" does not exist"
-- because migration 20260709150000_admin_products.sql — which adds this
-- column — was never applied to this database, even though later migrations
-- (including 20260710160000_admin_auth_hardening.sql, which redefines
-- admin_save_product()/admin_delete_product() and both read/write
-- is_featured) were applied on top of it. The RPCs are correctly installed
-- and already reference this column; only the column itself is missing.
--
-- This migration only adds the missing column and its supporting index — the
-- exact statements from 20260709150000_admin_products.sql, kept idempotent
-- so it is safe to run whether or not that migration ever partially applied.
-- It does not touch or redefine any function, so no feature (Featured,
-- Best Seller, New, Sale badges, or anything else) is removed or altered.
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

alter table public.products
  add column if not exists is_featured boolean not null default false;

create index if not exists products_created_at_idx on public.products (created_at desc);

-- Make PostgREST pick up the schema change immediately.
notify pgrst, 'reload schema';
