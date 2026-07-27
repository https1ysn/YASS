# Graph Report - .  (2026-07-26)

## Corpus Check
- 230 files · ~69,905 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 899 nodes · 2688 edges · 70 communities (45 shown, 25 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.76)
- Token cost: 660,914 input · 0 output

## Community Hubs (Navigation)
- Storefront UI & Cart State
- Admin Product & Category Forms
- Admin Customers & Categories Data
- Site Layout & Branding
- Project README & Stack Overview
- Supabase Client, Storage & Middleware
- Admin Navigation & UI Primitives
- UI Component Library (Cards, Alerts, Pagination)
- TypeScript Configuration
- Product Detail Page & Queries
- Admin Server Actions & Auth Session
- Admin Dashboard & Login UI
- Admin Tables (Orders, Customers, Products)
- Site Settings Schema & Actions
- Product Info & Selectors
- Admin Products Page & Gallery
- Runtime Dependencies (package.json)
- Dev Tooling Dependencies
- Checkout Page & Shared UI Shells
- Homepage Data & Supabase Types
- Admin Loading Skeletons
- Admin Orders Page & Dashboard Stats
- Admin Category Actions & Storage Cleanup
- Order Status Badges & Recent Orders
- Header Icons, Search & Theme Toggle
- Client-Side Interactive Components
- Collections Pages & Queries
- Homepage Sections
- Shop Browsing & Sorting
- Admin Layout & Toast Notifications
- Locale Layout & Shop Page
- Admin Topbar, Drawer & Overlay Hook
- Admin Customer Detail Page
- Checkout Order Placement
- NPM Scripts
- Admin Login Actions & Auth Schema
- Order Confirmation & Delivery Estimate
- Product Gallery Manager (Admin)
- ESLint Flat Config
- Package Metadata
- Placeholder Image Generator Script
- Admin Settings Page
- Next.js Config
- Women Category Image
- Instagram Feed Image (i4)
- Instagram Feed Image (i5)
- Product Placeholder Image (p7)
- ESLint Next Config Dependency
- React Hook Form Dependency
- Supabase JS Dependency
- Prettier Tailwind Plugin Dependency
- PostCSS Config
- Accessories Category Image
- Men Category Image
- Product Placeholder Image (p2)
- Product Placeholder Image (p4)
- DB Bootstrap Migrations (README)
- Place Order Function (README)
- Generic File Icon
- Generic Globe Icon
- Fragrance Category Image
- Product Placeholder Image (p1)
- Product Placeholder Image (p3)
- Product Placeholder Image (p5)
- Product Placeholder Image (p6)
- Product Placeholder Image (p8)
- Next.js Logo Asset
- Vercel Logo Asset
- Generic Window Icon

## God Nodes (most connected - your core abstractions)
1. `cn()` - 129 edges
2. `formatPrice()` - 48 edges
3. `react` - 46 edges
4. `localeHref()` - 39 edges
5. `createSupabaseServerClient()` - 29 edges
6. `AppLocale` - 27 edges
7. `Button` - 22 edges
8. `Card()` - 22 edges
9. `ButtonLink()` - 21 edges
10. `toast()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `AdminError()` --references--> `react`  [EXTRACTED]
  src/app/admin/(panel)/error.tsx → package.json
- `AdminTopbar()` --references--> `react`  [EXTRACTED]
  src/components/admin/admin-topbar.tsx → package.json
- `CategoriesToolbar()` --references--> `react`  [EXTRACTED]
  src/components/admin/categories-toolbar.tsx → package.json
- `CategoryForm()` --references--> `react`  [EXTRACTED]
  src/components/admin/category-form.tsx → package.json
- `CategoryRowActions()` --references--> `react`  [EXTRACTED]
  src/components/admin/category-row-actions.tsx → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Admin Access Control Flow** — readme_admin_authentication, readme_middleware, readme_requireadminaction_function, readme_is_admin_function [EXTRACTED 1.00]
- **Database Migration Bootstrap Sequence** — readme_initial_schema_migration, readme_seed_catalog_migration, readme_place_order_migration [EXTRACTED 1.00]
- **Form Validation Pattern (react-hook-form + zod)** — readme_zod, readme_react_hook_form, readme_hookform_resolvers [EXTRACTED 1.00]

## Communities (70 total, 25 thin omitted)

### Community 0 - "Storefront UI & Cart State"
Cohesion: 0.06
Nodes (66): AdminError(), SummaryCard(), CartItem(), CartItemProps, CartSummary(), CartSummaryProps, ContinueShopping(), ContinueShoppingProps (+58 more)

### Community 1 - "Admin Product & Category Forms"
Cohesion: 0.07
Nodes (32): metadata, colorLabel(), ItemsCard(), CategoryForm(), initialState(), label(), nextStatuses(), OrderStatusControl() (+24 more)

### Community 2 - "Admin Customers & Categories Data"
Cohesion: 0.06
Nodes (39): EditCategoryPage(), EditCategoryPageProps, metadata, AdminCategoriesPage(), AdminCustomersPage(), AdminCustomersPageProps, metadata, SORTS (+31 more)

### Community 3 - "Site Layout & Branding"
Cohesion: 0.14
Nodes (22): AdminPanelLayout(), StoreLayout(), AnnouncementBar(), brandFromSettings(), BrandIdentity, BrandMark(), BrandMarkProps, Copyright() (+14 more)

### Community 4 - "Project README & Stack Overview"
Cohesion: 0.07
Nodes (32): 20260710160000_admin_auth_hardening.sql, Admin authentication mechanism, 20260710140000_admin_categories.sql, 20260710150000_admin_customers.sql, 20260709140000_admin_dashboard.sql, admin_dashboard_stats(), /admin/login, 20260710130000_admin_orders.sql (+24 more)

### Community 5 - "Supabase Client, Storage & Middleware"
Cohesion: 0.11
Nodes (21): CategoryFormProps, FormState, ImageField(), Section, SettingsFormProps, Textarea, TextareaProps, AdminCategoryDetails (+13 more)

### Community 6 - "Admin Navigation & UI Primitives"
Cohesion: 0.14
Nodes (16): AdminNav(), AdminNavItem, items, AdminSidebar(), CategoryRowActions(), LogoutButton(), ProductRowActions(), CheckoutHeader() (+8 more)

### Community 7 - "UI Component Library (Cards, Alerts, Pagination)"
Cohesion: 0.11
Nodes (24): AlertProps, StatusIcon(), StatusVariant, variants, ButtonSize, ButtonVariant, ButtonLinkProps, CardContent() (+16 more)

### Community 8 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 9 - "Product Detail Page & Queries"
Cohesion: 0.14
Nodes (20): CartPage(), generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), generateStaticParams(), ProductPage(), ProductPageProps (+12 more)

### Community 10 - "Admin Server Actions & Auth Session"
Cohesion: 0.25
Nodes (19): friendlyError(), OrderStatusActionResult, updateOrderStatus(), addProductImage(), AdminActionResult, AdminImageActionResult, deleteProduct(), deleteProductImage() (+11 more)

### Community 11 - "Admin Dashboard & Login UI"
Cohesion: 0.13
Nodes (16): AdminLoginPage(), metadata, AdminCategoriesPageProps, metadata, SORTS, BestSellersPanel(), CategoriesTable(), CategoriesToolbar() (+8 more)

### Community 12 - "Admin Tables (Orders, Customers, Products)"
Cohesion: 0.26
Nodes (15): AdminOrderPage(), AdminOrderPageProps, formatDate(), metadata, CustomersTable(), formatDate(), OrderStatusBadge(), Card() (+7 more)

### Community 13 - "Site Settings Schema & Actions"
Cohesion: 0.12
Nodes (17): friendlyError(), isAllowedAsset(), saveSettings(), SaveSettingsResult, advancedSchema, announcementSchema, brandingSchema, contactSchema (+9 more)

### Community 14 - "Product Info & Selectors"
Cohesion: 0.20
Nodes (14): ColorOption, ColorSelector(), ColorSelectorProps, ProductAccordions(), ProductAccordionsProps, ProductGalleryProps, ProductInfoProps, QuantitySelector() (+6 more)

### Community 15 - "Admin Products Page & Gallery"
Cohesion: 0.12
Nodes (18): EditProductPage(), EditProductPageProps, metadata, metadata, NewProductPage(), AdminProductsPage(), AdminProductsPageProps, metadata (+10 more)

### Community 16 - "Runtime Dependencies (package.json)"
Cohesion: 0.11
Nodes (19): clsx, @hookform/resolvers, next, next-intl, dependencies, clsx, @hookform/resolvers, next (+11 more)

### Community 17 - "Dev Tooling Dependencies"
Cohesion: 0.11
Nodes (19): eslint, @eslint/eslintrc, devDependencies, eslint, @eslint/eslintrc, prettier, tailwindcss, @tailwindcss/postcss (+11 more)

### Community 18 - "Checkout Page & Shared UI Shells"
Cohesion: 0.29
Nodes (6): BagIcon(), buttonClasses(), ButtonLink(), Container(), sizes, EmptyState()

### Community 19 - "Homepage Data & Supabase Types"
Cohesion: 0.16
Nodes (15): HomePage(), baseProducts, collections, galleryPool, materialKeyByCategory, shopProducts, BEST_SELLER_SLUGS, FEATURED_SLUGS (+7 more)

### Community 21 - "Admin Orders Page & Dashboard Stats"
Cohesion: 0.17
Nodes (13): AdminOrdersPage(), AdminOrdersPageProps, metadata, SORTS, AdminOverviewPage(), metadata, ProductsPagination(), Alert() (+5 more)

### Community 22 - "Admin Category Actions & Storage Cleanup"
Cohesion: 0.26
Nodes (12): AdminCategoryActionResult, deleteCategory(), friendlyError(), revalidateCatalog(), saveCategory(), removeFromStorage(), isProductStorageUrl(), publicPrefix() (+4 more)

### Community 23 - "Order Status Badges & Recent Orders"
Cohesion: 0.18
Nodes (12): formatPaymentMethod(), paymentLabels, statusVariant, formatDate(), OrdersTable(), formatDate(), RecentOrders(), statusVariant (+4 more)

### Community 24 - "Header Icons, Search & Theme Toggle"
Cohesion: 0.19
Nodes (10): HeartIcon(), Icon(), iconActionClasses, IconProps, SearchIcon(), SearchBar(), applyTheme(), Theme (+2 more)

### Community 25 - "Client-Side Interactive Components"
Cohesion: 0.32
Nodes (12): react, react, CartView(), CheckoutForm(), CartButton(), CartButtonProps, ProductInfo(), ProductQuickView() (+4 more)

### Community 26 - "Collections Pages & Queries"
Cohesion: 0.24
Nodes (11): CollectionsPage(), generateMetadata(), CategoryPage(), CategoryPageProps, generateMetadata(), generateStaticParams(), CollectionHero(), getCollectionBySlug() (+3 more)

### Community 27 - "Homepage Sections"
Cohesion: 0.31
Nodes (10): StoreNotFound(), MiniCartDrawer(), Benefits(), BestSellers(), CallToAction(), FeaturedCategories(), FeaturedCategoryItem, FeaturedProducts() (+2 more)

### Community 28 - "Shop Browsing & Sorting"
Cohesion: 0.23
Nodes (10): CollectionGridProps, ProductBrowser(), ProductBrowserProps, ProductGrid(), ProductGridProps, ProductToolbar(), ProductToolbarProps, SortDropdown() (+2 more)

### Community 29 - "Admin Layout & Toast Notifications"
Cohesion: 0.21
Nodes (9): geistMono, geistSans, generateMetadata(), ToastCard(), Toaster(), ToasterProps, ToastItem, ToastState (+1 more)

### Community 30 - "Locale Layout & Shop Page"
Cohesion: 0.23
Nodes (9): cairo, geistMono, geistSans, generateMetadata(), LocaleLayout(), generateMetadata(), ShopPage(), isRtlLocale() (+1 more)

### Community 31 - "Admin Topbar, Drawer & Overlay Hook"
Cohesion: 0.25
Nodes (8): AdminSidebarContent(), AdminTopbar(), pageTitle(), MenuIcon(), Drawer(), DrawerProps, sides, useOverlay()

### Community 32 - "Admin Customer Detail Page"
Cohesion: 0.27
Nodes (7): AdminCustomerPage(), AdminCustomerPageProps, formatDate(), metadata, OrdersHistoryCard(), AdminCustomerDetails, getAdminCustomerById()

### Community 33 - "Checkout Order Placement"
Cohesion: 0.29
Nodes (7): friendlyError(), placeOrder(), PlaceOrderResult, CheckoutInput, checkoutSchema, createCheckoutSchema(), Translator

### Community 34 - "NPM Scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, format, format:check, lint, lint:fix, start (+1 more)

### Community 35 - "Admin Login Actions & Auth Schema"
Cohesion: 0.39
Nodes (6): AuthActionResult, friendlyAuthError(), signInAdmin(), signOutAdmin(), AdminLoginInput, adminLoginSchema

### Community 36 - "Order Confirmation & Delivery Estimate"
Cohesion: 0.36
Nodes (5): OrderConfirmationPage(), OrderConfirmationPageProps, OrderConfirmation(), OrderConfirmationProps, estimateDeliveryRange()

### Community 37 - "Product Gallery Manager (Admin)"
Cohesion: 0.28
Nodes (7): ACCEPT_ATTR, ACCEPTED_TYPES, iconButtonClasses, ProductGalleryManagerProps, UploadTask, validateFile(), AdminProductImage

### Community 38 - "ESLint Flat Config"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 39 - "Package Metadata"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 41 - "Admin Settings Page"
Cohesion: 0.50
Nodes (3): AdminSettingsPage(), metadata, SettingsForm()

### Community 43 - "Women Category Image"
Cohesion: 0.67
Nodes (3): Women Product Category, Women Category Thumbnail (Abstract Gradient), Abstract Warm-Toned Gradient Placeholder Style

### Community 44 - "Instagram Feed Image (i4)"
Cohesion: 0.67
Nodes (3): Abstract Warm-Tone Gradient with Overlapping Translucent Circles, Instagram Feed Thumbnail i4 (Abstract Gradient Placeholder), Storefront Instagram Feed Section

### Community 45 - "Instagram Feed Image (i5)"
Cohesion: 0.67
Nodes (3): Warm Beige-Tan Gradient with Overlapping Circles, Instagram Feed Thumbnail (i5.jpg), Abstract Placeholder Image (No Product/People Depicted)

### Community 46 - "Product Placeholder Image (p7)"
Cohesion: 0.67
Nodes (3): public/images/products Directory, Product Image p7.jpg (Abstract Placeholder Graphic), Warm Tan Gradient Placeholder Style

## Knowledge Gaps
- **233 isolated node(s):** `__filename`, `__dirname`, `compat`, `eslintConfig`, `withNextIntl` (+228 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Admin Navigation & UI Primitives` to `Storefront UI & Cart State`, `Admin Product & Category Forms`, `Site Layout & Branding`, `Supabase Client, Storage & Middleware`, `UI Component Library (Cards, Alerts, Pagination)`, `Product Detail Page & Queries`, `Admin Dashboard & Login UI`, `Admin Tables (Orders, Customers, Products)`, `Product Info & Selectors`, `Admin Products Page & Gallery`, `Checkout Page & Shared UI Shells`, `Admin Loading Skeletons`, `Admin Orders Page & Dashboard Stats`, `Order Status Badges & Recent Orders`, `Header Icons, Search & Theme Toggle`, `Client-Side Interactive Components`, `Shop Browsing & Sorting`, `Admin Layout & Toast Notifications`, `Admin Topbar, Drawer & Overlay Hook`, `Product Gallery Manager (Admin)`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `react` connect `Client-Side Interactive Components` to `Storefront UI & Cart State`, `Admin Product & Category Forms`, `Admin Customers & Categories Data`, `Site Layout & Branding`, `Supabase Client, Storage & Middleware`, `Admin Navigation & UI Primitives`, `Admin Settings Page`, `Product Detail Page & Queries`, `Admin Dashboard & Login UI`, `Admin Products Page & Gallery`, `Runtime Dependencies (package.json)`, `Admin Orders Page & Dashboard Stats`, `Header Icons, Search & Theme Toggle`, `Shop Browsing & Sorting`, `Admin Layout & Toast Notifications`, `Admin Topbar, Drawer & Overlay Hook`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies (package.json)` to `React Hook Form Dependency`, `Client-Side Interactive Components`, `Supabase JS Dependency`, `Package Metadata`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **What connects `__filename`, `__dirname`, `compat` to the rest of the system?**
  _233 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Storefront UI & Cart State` be split into smaller, more focused modules?**
  _Cohesion score 0.05660377358490566 - nodes in this community are weakly interconnected._
- **Should `Admin Product & Category Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.07342995169082125 - nodes in this community are weakly interconnected._
- **Should `Admin Customers & Categories Data` be split into smaller, more focused modules?**
  _Cohesion score 0.059233449477351915 - nodes in this community are weakly interconnected._