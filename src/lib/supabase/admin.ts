import { isSupabaseConfigured } from "./config";
import { createSupabaseServerClient } from "./server";
import { isOrderStatus } from "@/lib/order-status";

/**
 * Admin dashboard read model — a single aggregate RPC so the RLS-protected
 * customer/order tables are only exposed through one narrow surface.
 */

export interface AdminRecentOrder {
  order_number: string;
  customer_name: string;
  shipping_city: string;
  shipping_method: string;
  status: string;
  total: number | string;
  created_at: string;
  item_count: number;
}

export interface AdminBestSeller {
  product_name: string;
  slug: string | null;
  image_url: string | null;
  units_sold: number;
  revenue: number | string;
}

export interface AdminDashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: AdminRecentOrder[];
  bestSellers: AdminBestSeller[];
}

interface RawStats {
  total_products?: number;
  total_categories?: number;
  total_customers?: number;
  total_orders?: number;
  total_revenue?: number | string;
  recent_orders?: AdminRecentOrder[];
  best_sellers?: AdminBestSeller[];
}

export type AdminStatsResult =
  { ok: true; stats: AdminDashboardStats } | { ok: false; error: string };

function friendlyError(message: string, code?: string): string {
  if (/admin_customer/i.test(message)) {
    return "Customers management isn't fully set up yet — apply the latest database migration (20260710150000_admin_customers.sql) and refresh.";
  }
  if (/admin_order|admin_update_order/i.test(message)) {
    return "Orders management isn't fully set up yet — apply the latest database migration (20260710130000_admin_orders.sql) and refresh.";
  }
  if (code === "PGRST202" || /admin_dashboard_stats/i.test(message)) {
    return "The dashboard isn't fully set up yet — apply the latest database migration (20260709140000_admin_dashboard.sql) and refresh.";
  }
  if (/fetch failed|network|ENOTFOUND|ECONN|timeout/i.test(message)) {
    return "We couldn't reach the database. Check your connection and refresh.";
  }
  return message || "Something went wrong while loading the dashboard.";
}

export async function getAdminDashboardStats(): Promise<AdminStatsResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured — check your environment variables." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_dashboard_stats");
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    const raw = (data ?? {}) as RawStats;
    return {
      ok: true,
      stats: {
        totalProducts: raw.total_products ?? 0,
        totalCategories: raw.total_categories ?? 0,
        totalCustomers: raw.total_customers ?? 0,
        totalOrders: raw.total_orders ?? 0,
        totalRevenue: Number(raw.total_revenue ?? 0),
        recentOrders: raw.recent_orders ?? [],
        bestSellers: raw.best_sellers ?? [],
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

/* ------------------------------------------------------ products management */

export const ADMIN_PRODUCTS_PER_PAGE = 8;

export type AdminProductSort = "newest" | "oldest" | "name" | "price-desc" | "price-asc";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

export interface AdminProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string | null;
  categoryName: string;
  price: number;
  compareAtPrice: number | null;
  availability: "in-stock" | "made-to-order";
  badge: string | null;
  colors: string[];
  sizes: string[];
  isFeatured: boolean;
  imageUrl: string | null;
  /** Full gallery, sorted — position 0 is the primary image. */
  images: AdminProductImage[];
  createdAt: string;
}

export interface AdminProductsQuery {
  q?: string;
  category?: string;
  sort?: AdminProductSort;
  page?: number;
}

export type AdminProductsResult =
  | {
      ok: true;
      products: AdminProduct[];
      total: number;
      page: number;
      totalPages: number;
    }
  | { ok: false; error: string };

interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  availability: string;
  badge: string | null;
  colors: string[] | null;
  sizes: string[] | null;
  is_featured?: boolean;
  created_at: string;
  category: { id: string; name: string } | null;
  images: { id: string; url: string; alt: string | null; sort_order: number }[] | null;
}

/** Cookie-aware client — admin RPCs and reads run as the signed-in admin. */
function adminClient() {
  return createSupabaseServerClient();
}

function mapAdminProduct(row: AdminProductRow): AdminProduct {
  const images = [...(row.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return {
    images: images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sort_order,
    })),
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    categoryId: row.category?.id ?? null,
    categoryName: row.category?.name ?? "—",
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    availability: row.availability === "made-to-order" ? "made-to-order" : "in-stock",
    badge: row.badge,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    isFeatured: row.is_featured ?? false,
    imageUrl: images[0]?.url ?? null,
    createdAt: row.created_at,
  };
}

const ADMIN_PRODUCT_SELECT =
  "*, category:categories(id, name), images:product_images(id, url, alt, sort_order)";

export async function getAdminProducts(
  query: AdminProductsQuery = {}
): Promise<AdminProductsResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured — check your environment variables." };
  }

  const page = Math.max(1, query.page ?? 1);
  const from = (page - 1) * ADMIN_PRODUCTS_PER_PAGE;

  try {
    let builder = (await adminClient())
      .from("products")
      .select(ADMIN_PRODUCT_SELECT, { count: "exact" });

    if (query.q) {
      // Commas/parens would break PostgREST's or() syntax.
      const safe = query.q.replace(/[,()]/g, " ").trim();
      if (safe) builder = builder.or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`);
    }
    if (query.category) {
      builder = builder.eq("category_id", query.category);
    }

    switch (query.sort) {
      case "oldest":
        builder = builder.order("created_at", { ascending: true });
        break;
      case "name":
        builder = builder.order("name", { ascending: true });
        break;
      case "price-desc":
        builder = builder.order("price", { ascending: false });
        break;
      case "price-asc":
        builder = builder.order("price", { ascending: true });
        break;
      default:
        builder = builder.order("created_at", { ascending: false });
    }

    const { data, count, error } = await builder.range(from, from + ADMIN_PRODUCTS_PER_PAGE - 1);

    // An out-of-range page is an empty result, not a failure.
    if (error && error.code !== "PGRST103") {
      return { ok: false, error: friendlyError(error.message, error.code) };
    }

    const total = count ?? 0;
    return {
      ok: true,
      products: ((data ?? []) as unknown as AdminProductRow[]).map(mapAdminProduct),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / ADMIN_PRODUCTS_PER_PAGE)),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await (await adminClient())
      .from("products")
      .select(ADMIN_PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return mapAdminProduct(data as unknown as AdminProductRow);
  } catch {
    return null;
  }
}

/* ---------------------------------------------------- categories management */

export const ADMIN_CATEGORIES_PER_PAGE = 8;

export type AdminCategorySort = "sort-order" | "name" | "newest" | "oldest";

export interface AdminCategoryDetails {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
  isComingSoon: boolean;
  productCount: number;
  createdAt: string;
}

export interface AdminCategoriesQuery {
  q?: string;
  sort?: AdminCategorySort;
  page?: number;
}

export type AdminCategoriesResult =
  | {
      ok: true;
      categories: AdminCategoryDetails[];
      total: number;
      page: number;
      totalPages: number;
    }
  | { ok: false; error: string };

interface AdminCategoryDbRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_coming_soon: boolean;
  sort_order: number;
  created_at: string;
  products: { count: number }[] | null;
}

const ADMIN_CATEGORY_SELECT =
  "id, slug, name, description, image_url, is_coming_soon, sort_order, created_at, products(count)";

function mapAdminCategory(row: AdminCategoryDbRow): AdminCategoryDetails {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isComingSoon: row.is_coming_soon,
    productCount: row.products?.[0]?.count ?? 0,
    createdAt: row.created_at,
  };
}

export async function getAdminCategoriesList(
  query: AdminCategoriesQuery = {}
): Promise<AdminCategoriesResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured — check your environment variables." };
  }

  const page = Math.max(1, query.page ?? 1);
  const from = (page - 1) * ADMIN_CATEGORIES_PER_PAGE;

  try {
    let builder = (await adminClient())
      .from("categories")
      .select(ADMIN_CATEGORY_SELECT, { count: "exact" });

    if (query.q) {
      // Commas/parens would break PostgREST's or() syntax.
      const safe = query.q.replace(/[,()]/g, " ").trim();
      if (safe) builder = builder.or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`);
    }

    switch (query.sort) {
      case "name":
        builder = builder.order("name", { ascending: true });
        break;
      case "newest":
        builder = builder.order("created_at", { ascending: false });
        break;
      case "oldest":
        builder = builder.order("created_at", { ascending: true });
        break;
      default:
        builder = builder
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });
    }

    const { data, count, error } = await builder.range(
      from,
      from + ADMIN_CATEGORIES_PER_PAGE - 1
    );

    // An out-of-range page is an empty result, not a failure.
    if (error && error.code !== "PGRST103") {
      return { ok: false, error: friendlyError(error.message, error.code) };
    }

    const total = count ?? 0;
    return {
      ok: true,
      categories: ((data ?? []) as unknown as AdminCategoryDbRow[]).map(mapAdminCategory),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / ADMIN_CATEGORIES_PER_PAGE)),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

export async function getAdminCategoryById(id: string): Promise<AdminCategoryDetails | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await (await adminClient())
      .from("categories")
      .select(ADMIN_CATEGORY_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return mapAdminCategory(data as unknown as AdminCategoryDbRow);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------- orders management */

export const ADMIN_ORDERS_PER_PAGE = 8;

export type AdminOrderSort = "newest" | "oldest" | "total-desc" | "total-asc";

export {
  ORDER_STATUS_FLOW,
  ORDER_STATUSES,
  isOrderStatus,
  type AdminOrderStatus,
} from "@/lib/order-status";

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  total: number;
  paymentMethod: string;
  status: string;
  itemCount: number;
  createdAt: string;
}

export interface AdminOrdersQuery {
  q?: string;
  status?: string;
  sort?: AdminOrderSort;
  page?: number;
}

export type AdminOrdersResult =
  | {
      ok: true;
      orders: AdminOrderListItem[];
      total: number;
      page: number;
      totalPages: number;
    }
  | { ok: false; error: string };

interface AdminOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  shipping_city: string;
  total: number | string;
  payment_method: string;
  status: string;
  created_at: string;
  item_count: number;
}

export async function getAdminOrders(query: AdminOrdersQuery = {}): Promise<AdminOrdersResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured — check your environment variables." };
  }

  const page = Math.max(1, query.page ?? 1);

  try {
    const { data, error } = await (await adminClient()).rpc("admin_orders", {
      p_q: query.q?.trim() || null,
      p_status: query.status && isOrderStatus(query.status) ? query.status : null,
      p_sort: query.sort ?? "newest",
      p_limit: ADMIN_ORDERS_PER_PAGE,
      p_offset: (page - 1) * ADMIN_ORDERS_PER_PAGE,
    });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    const raw = (data ?? {}) as { total?: number; orders?: AdminOrderRow[] };
    const total = raw.total ?? 0;
    return {
      ok: true,
      orders: (raw.orders ?? []).map((row) => ({
        id: row.id,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        phone: row.phone,
        city: row.shipping_city,
        total: Number(row.total),
        paymentMethod: row.payment_method,
        status: row.status,
        itemCount: row.item_count,
        createdAt: row.created_at,
      })),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / ADMIN_ORDERS_PER_PAGE)),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

export interface AdminOrderItem {
  id: string;
  productName: string;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  slug: string | null;
  imageUrl: string | null;
}

export interface AdminOrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  shippingMethod: string;
  shippingCountry: string;
  shippingCity: string;
  shippingStreet: string;
  shippingPostal: string | null;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  notes: string | null;
  createdAt: string;
  customer: { name: string; phone: string; email: string | null };
  items: AdminOrderItem[];
}

interface AdminOrderDetailsRow {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  shipping_method: string;
  shipping_country: string;
  shipping_city: string;
  shipping_street: string;
  shipping_postal: string | null;
  subtotal: number | string;
  discount: number | string;
  shipping_cost: number | string;
  total: number | string;
  notes: string | null;
  created_at: string;
  customer: { name: string; phone: string; email: string | null };
  items: {
    id: string;
    product_name: string;
    size: string | null;
    color: string | null;
    unit_price: number | string;
    quantity: number;
    slug: string | null;
    image_url: string | null;
  }[];
}

export type AdminOrderDetailsResult =
  | { ok: true; order: AdminOrderDetails | null }
  | { ok: false; error: string };

export async function getAdminOrderById(id: string): Promise<AdminOrderDetailsResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured — check your environment variables." };
  }

  try {
    const { data, error } = await (await adminClient()).rpc("admin_order_details", { p_id: id });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };
    if (!data) return { ok: true, order: null };

    const row = data as AdminOrderDetailsRow;
    return {
      ok: true,
      order: {
        id: row.id,
        orderNumber: row.order_number,
        status: row.status,
        paymentMethod: row.payment_method,
        shippingMethod: row.shipping_method,
        shippingCountry: row.shipping_country,
        shippingCity: row.shipping_city,
        shippingStreet: row.shipping_street,
        shippingPostal: row.shipping_postal,
        subtotal: Number(row.subtotal),
        discount: Number(row.discount),
        shippingCost: Number(row.shipping_cost),
        total: Number(row.total),
        notes: row.notes,
        createdAt: row.created_at,
        customer: row.customer,
        items: (row.items ?? []).map((item) => ({
          id: item.id,
          productName: item.product_name,
          size: item.size,
          color: item.color,
          unitPrice: Number(item.unit_price),
          quantity: item.quantity,
          slug: item.slug,
          imageUrl: item.image_url,
        })),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

/* ----------------------------------------------------- customers management */

export const ADMIN_CUSTOMERS_PER_PAGE = 8;

export type AdminCustomerSort = "newest" | "oldest" | "orders-desc" | "spent-desc" | "name";

export interface AdminCustomerListItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  createdAt: string;
}

export interface AdminCustomersQuery {
  q?: string;
  sort?: AdminCustomerSort;
  page?: number;
}

export type AdminCustomersResult =
  | {
      ok: true;
      customers: AdminCustomerListItem[];
      total: number;
      page: number;
      totalPages: number;
    }
  | { ok: false; error: string };

interface AdminCustomerRow {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number | string;
  last_order_at: string | null;
  last_city: string | null;
}

export async function getAdminCustomers(
  query: AdminCustomersQuery = {}
): Promise<AdminCustomersResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured — check your environment variables." };
  }

  const page = Math.max(1, query.page ?? 1);

  try {
    const { data, error } = await (await adminClient()).rpc("admin_customers", {
      p_q: query.q?.trim() || null,
      p_sort: query.sort ?? "newest",
      p_limit: ADMIN_CUSTOMERS_PER_PAGE,
      p_offset: (page - 1) * ADMIN_CUSTOMERS_PER_PAGE,
    });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    const raw = (data ?? {}) as { total?: number; customers?: AdminCustomerRow[] };
    const total = raw.total ?? 0;
    return {
      ok: true,
      customers: (raw.customers ?? []).map((row) => ({
        id: row.id,
        name: row.full_name,
        phone: row.phone,
        email: row.email,
        city: row.last_city,
        totalOrders: row.total_orders,
        totalSpent: Number(row.total_spent),
        lastOrderAt: row.last_order_at,
        createdAt: row.created_at,
      })),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / ADMIN_CUSTOMERS_PER_PAGE)),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

export interface AdminCustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface AdminCustomerDetails {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
  address: { street: string; city: string; postal: string | null; country: string } | null;
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrder: number;
    firstOrderAt: string | null;
    lastOrderAt: string | null;
  };
  orders: AdminCustomerOrder[];
}

interface AdminCustomerDetailsRow {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  created_at: string;
  address: { street: string; city: string; postal: string | null; country: string } | null;
  stats: {
    total_orders: number;
    paid_orders: number;
    total_spent: number | string;
    first_order_at: string | null;
    last_order_at: string | null;
  };
  orders: {
    id: string;
    order_number: string;
    status: string;
    total: number | string;
    item_count: number;
    created_at: string;
  }[];
}

export type AdminCustomerDetailsResult =
  | { ok: true; customer: AdminCustomerDetails | null }
  | { ok: false; error: string };

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetailsResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured — check your environment variables." };
  }

  try {
    const { data, error } = await (await adminClient()).rpc("admin_customer_details", {
      p_id: id,
    });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };
    if (!data) return { ok: true, customer: null };

    const row = data as AdminCustomerDetailsRow;
    const totalSpent = Number(row.stats.total_spent);
    return {
      ok: true,
      customer: {
        id: row.id,
        name: row.full_name,
        phone: row.phone,
        email: row.email,
        createdAt: row.created_at,
        address: row.address,
        stats: {
          totalOrders: row.stats.total_orders,
          totalSpent,
          averageOrder: row.stats.paid_orders > 0 ? totalSpent / row.stats.paid_orders : 0,
          firstOrderAt: row.stats.first_order_at,
          lastOrderAt: row.stats.last_order_at,
        },
        orders: (row.orders ?? []).map((order) => ({
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          total: Number(order.total),
          itemCount: order.item_count,
          createdAt: order.created_at,
        })),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await (await adminClient())
      .from("categories")
      .select("id, name, slug")
      .order("sort_order", { ascending: true });
    if (error) return [];
    return (data ?? []) as AdminCategory[];
  } catch {
    return [];
  }
}
