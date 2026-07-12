# Yasso Store

Production-ready e-commerce foundation built with:

- **Next.js 15** (App Router, Turbopack)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4**

## Getting Started

```bash
npm install        # install dependencies
cp .env.example .env.local   # configure environment (already created)
npm run dev        # start dev server at http://localhost:3000
```

## Scripts

| Script                 | Purpose                           |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start dev server (Turbopack)      |
| `npm run build`        | Production build                  |
| `npm run start`        | Serve production build            |
| `npm run lint`         | Run ESLint                        |
| `npm run lint:fix`     | Run ESLint with auto-fix          |
| `npm run type-check`   | TypeScript check without emitting |
| `npm run format`       | Format with Prettier              |
| `npm run format:check` | Check formatting                  |

## Key Dependencies

| Package                                   | Purpose                               |
| ----------------------------------------- | ------------------------------------- |
| `zustand`                                 | Client state (cart, UI state)         |
| `zod`                                     | Schema validation                     |
| `react-hook-form` + `@hookform/resolvers` | Forms with zod validation             |
| `clsx` + `tailwind-merge`                 | Conditional / merged Tailwind classes |
| `prettier-plugin-tailwindcss`             | Auto-sorted Tailwind classes          |

## Folder Structure

```
src/
├── app/                  # App Router (routes, layouts, route handlers)
├── components/
│   ├── ui/               # Primitive, reusable UI (Button, Input, Badge…)
│   ├── layout/           # Header, Footer, Nav, page shells
│   ├── shared/           # Cross-feature composites (Pagination, EmptyState…)
│   ├── product/          # Product-domain components (cards, galleries…)
│   ├── cart/             # Cart-domain components
│   └── checkout/         # Checkout-domain components
├── lib/                  # Framework-agnostic helpers (cn, formatters, fetch wrappers)
├── hooks/                # Custom React hooks
├── store/                # Zustand stores (cart, wishlist, UI)
├── services/             # Data access / business logic (product, order services)
├── schemas/              # Zod schemas (shared validation)
├── types/                # Global TypeScript types & interfaces
├── config/               # Site config (metadata, nav links, feature flags)
├── constants/            # Static constants (routes, keys, enums)
└── styles/               # Additional global styles / Tailwind layers

public/
└── images/
    └── products/         # Static product imagery
```

### Conventions

- Path alias: `@/*` → `src/*` (e.g. `import { x } from "@/lib/x"`)
- Server Components by default; add `"use client"` only where needed.
- Secrets live in `.env.local` (gitignored); document every variable in `.env.example`.
- Domain logic belongs in `services/`; components stay presentational.

## Supabase

The catalog (categories, products, product images) is served from Supabase; customer/order
tables exist for the next phase. Set the env vars in `.env.local` (see `.env.example`).

**Apply the migrations** (one-time, in order) — either paste each file from
`supabase/migrations/` into the Supabase **SQL Editor** and run it, or use the CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

1. `20260709120000_initial_schema.sql` — tables, indexes, RLS policies, `products` storage bucket
2. `20260709120100_seed_catalog.sql` — seeds the placeholder catalog
3. `20260709130000_place_order.sql` — the atomic `place_order()` function used by checkout
   (SECURITY DEFINER, so customers/orders/order_items stay locked down under RLS)
4. `20260709140000_admin_dashboard.sql` — the aggregate `admin_dashboard_stats()` function
   powering /admin (restrict its grant once admin auth ships)
5. `20260709150000_admin_products.sql` — `is_featured` column plus the `admin_save_product()` /
   `admin_delete_product()` functions used by /admin/products (restrict once auth ships)
6. `20260710120000_product_images_admin.sql` — the `admin_*_product_image(s)` functions and
   `products` bucket write policies powering the gallery manager on the product edit page
   (restrict once auth ships)
7. `20260710130000_admin_orders.sql` — extends the order status lifecycle (pending → paid →
   processing → shipped → delivered, plus cancelled) and adds the `admin_orders()` /
   `admin_order_details()` / `admin_update_order_status()` functions powering /admin/orders
   (restrict once auth ships)
8. `20260710140000_admin_categories.sql` — the `admin_save_category()` / `admin_delete_category()`
   functions powering /admin/categories; deletion is refused while a category still contains
   products (restrict once auth ships)
9. `20260710150000_admin_customers.sql` — the `admin_customers()` / `admin_customer_details()`
   functions powering /admin/customers, with per-client order aggregates and history
   (restrict once auth ships)
10. `20260710160000_admin_auth_hardening.sql` — delivers the "restrict once auth ships" notes:
    adds `is_admin()` (JWT email against the allow-list), guards every `admin_*` function with
    it, moves their grants from `anon` to `authenticated`, and makes the products-bucket write
    policies admin-only. Catalog reads and `place_order()` stay public.
11. `20260711120000_products_is_featured_column.sql` — repairs a database that never received
    migration 5's `is_featured` column (while later migrations were applied on top of it),
    which broke every product create/update with "column is_featured does not exist". Adds
    only the missing column and its index — no function is touched.

## Admin authentication

The admin (`/admin/**`) is protected by Supabase Auth:

- **Login** at `/admin/login` (email + password). Only emails in the allow-list
  (`src/lib/auth/admins.ts`, mirrored by the `is_admin()` SQL function) may enter; any other
  account is signed straight back out with an "Unauthorized" message.
- **Middleware** (`src/middleware.ts`) validates the session server-side on every `/admin`
  request and redirects guests to the login page (and signed-in admins away from it).
- The dashboard shell re-validates the session in its layout, every server action calls
  `requireAdminAction()`, and — once migration 10 is applied — the database itself refuses
  admin RPCs and storage writes from anyone but the allow-listed admin.

**One-time setup** (Supabase Dashboard):

1. Authentication → Users → *Add user* → create `elbiadyassin25@gmail.com` with a strong
   password (check *Auto confirm email*).
2. Authentication → Sign In / Up → disable *Allow new users to sign up* (nobody else needs an
   account).
3. Apply migration 10 (see above).

Until the migrations run, every query silently falls back to the local placeholder catalog in
`src/constants/`, so the site renders identically either way. Catalog pages revalidate every
60 s (`export const revalidate = 60`), so seeded data appears within a minute in production;
in dev it appears on the next request.
