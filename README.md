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
