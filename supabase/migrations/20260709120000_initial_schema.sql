-- ============================================================================
-- Yasso Store — initial schema
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- categories
create table if not exists public.categories (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  description    text,
  image_url      text,
  is_coming_soon boolean not null default false,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists categories_sort_order_idx on public.categories (sort_order);

-- ------------------------------------------------------------------ products
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  description      text,
  price            numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price >= 0),
  category_id      uuid not null references public.categories (id) on delete restrict,
  badge            text,
  colors           text[] not null default '{}',
  sizes            text[] not null default '{}',
  availability     text not null default 'in-stock'
                   check (availability in ('in-stock', 'made-to-order')),
  -- Extra curated collections (e.g. summer-capsule) beyond the main category.
  collection_slugs text[] not null default '{}',
  rating           numeric(2, 1) not null default 4.8 check (rating between 0 and 5),
  review_count     integer not null default 0 check (review_count >= 0),
  created_at       timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_badge_idx on public.products (badge);
create index if not exists products_collection_slugs_idx on public.products using gin (collection_slugs);

-- ------------------------------------------------------------ product_images
create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,
  alt        text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx
  on public.product_images (product_id, sort_order);

-- ----------------------------------------------------------------- customers
create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  phone      text not null,
  email      text,
  created_at timestamptz not null default now()
);

create index if not exists customers_phone_idx on public.customers (phone);
create index if not exists customers_email_idx on public.customers (email);

-- -------------------------------------------------------------------- orders
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique,
  customer_id      uuid references public.customers (id) on delete set null,
  status           text not null default 'pending'
                   check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_country text not null default 'Morocco',
  shipping_city    text not null,
  shipping_street  text not null,
  shipping_postal  text,
  shipping_method  text not null default 'standard'
                   check (shipping_method in ('standard', 'express')),
  payment_method   text not null default 'cod'
                   check (payment_method in ('cod', 'card', 'paypal')),
  subtotal         numeric(10, 2) not null default 0 check (subtotal >= 0),
  discount         numeric(10, 2) not null default 0 check (discount >= 0),
  shipping_cost    numeric(10, 2) not null default 0 check (shipping_cost >= 0),
  total            numeric(10, 2) not null default 0 check (total >= 0),
  notes            text,
  created_at       timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- --------------------------------------------------------------- order_items
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   uuid references public.products (id) on delete set null,
  product_name text not null,
  size         text,
  color        text,
  unit_price   numeric(10, 2) not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  created_at   timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

-- ============================================================================
-- Row Level Security
-- Catalog tables are publicly readable. Customer/order tables have RLS enabled
-- with NO public policies: anonymous clients are denied everything, and only
-- the service role (backend, added in a later phase) can access them.
-- ============================================================================

alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.customers      enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read products" on public.products;
create policy "Public read products"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read product images" on public.product_images;
create policy "Public read product images"
  on public.product_images for select
  to anon, authenticated
  using (true);

-- customers / orders / order_items: deny-by-default (no policies on purpose).

-- ============================================================================
-- Storage: public "products" bucket for product imagery
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "Public read products bucket" on storage.objects;
create policy "Public read products bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'products');
