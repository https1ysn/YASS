import { createClient } from "@supabase/supabase-js";
import type { Collection, Product } from "@/types/product";
import {
  collections as fallbackCollections,
  shopProducts as fallbackProducts,
} from "@/constants/shop";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";
import type { CategoryRow, ProductRow } from "./types";

/**
 * Catalog queries. All reads are anonymous (public catalog), so a plain
 * stateless client is used — this keeps pages statically renderable.
 *
 * Every query falls back to the local placeholder catalog when Supabase is
 * unreachable or not yet migrated, so the UI renders identically either way.
 */

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

const PRODUCT_SELECT = `
  id, slug, name, description, price, compare_at_price, badge, colors, sizes,
  availability, collection_slugs, rating, review_count,
  category:categories ( slug, name ),
  images:product_images ( url, alt, sort_order )
`;

function warnFallback(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
    console.warn(`[supabase] ${scope}: using local placeholder data (${message})`);
  }
}

function mapProduct(row: ProductRow): Product {
  const images = [...(row.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const gallery = images.map((image) => image.url);

  return {
    slug: row.slug,
    name: row.name,
    href: `/products/${row.slug}`,
    imageSrc: gallery[0] ?? "/images/products/p1.jpg",
    imageAlt: images[0]?.alt ?? undefined,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    category: row.category?.name ?? "",
    badge: row.badge ?? undefined,
    description: row.description ?? "",
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    availability: row.availability === "made-to-order" ? "made-to-order" : "in-stock",
    collections: [row.category?.slug, ...(row.collection_slugs ?? [])].filter(
      (slug): slug is string => Boolean(slug)
    ),
    rating: Number(row.rating ?? 4.8),
    reviewCount: row.review_count ?? 0,
    galleryImages: gallery.length > 0 ? gallery : undefined,
  };
}

/** All products, primary catalog order. */
export async function getProducts(): Promise<Product[]> {
  if (!supabase) return fallbackProducts;
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return fallbackProducts;
    return (data as unknown as ProductRow[]).map(mapProduct);
  } catch (error) {
    warnFallback("getProducts", error);
    return fallbackProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}

/** Products belonging to a collection (category or curated capsule). */
export async function getProductsByCollection(slug: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.collections.includes(slug));
}

/** All collections with live piece counts. */
export async function getCollections(): Promise<Collection[]> {
  if (!supabase) return fallbackCollections;
  try {
    const [{ data, error }, products] = await Promise.all([
      supabase
        .from("categories")
        .select("id, slug, name, description, image_url, is_coming_soon, sort_order")
        .order("sort_order", { ascending: true }),
      getProducts(),
    ]);
    if (error) throw error;
    if (!data || data.length === 0) return fallbackCollections;
    return (data as unknown as CategoryRow[]).map((row) => ({
      slug: row.slug,
      name: row.name,
      description: row.description ?? "",
      imageSrc: row.image_url ?? "/images/categories/women.jpg",
      pieceCount: products.filter((product) => product.collections.includes(row.slug)).length,
      comingSoon: row.is_coming_soon || undefined,
    }));
  } catch (error) {
    warnFallback("getCollections", error);
    return fallbackCollections;
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  const collections = await getCollections();
  return collections.find((collection) => collection.slug === slug);
}

/** Live categories only (excludes "coming soon") — powers the Shop sidebar
 * category filter, so it always mirrors what's in Supabase. */
export async function getShopCategories(): Promise<Collection[]> {
  const collections = await getCollections();
  return collections.filter((collection) => !collection.comingSoon);
}

/** The four shop-by-category tiles on the homepage. */
export async function getFeaturedCategories() {
  const collections = await getCollections();
  const featured = ["women", "men", "accessories", "fragrance"];
  return collections
    .filter((collection) => featured.includes(collection.slug))
    .sort((a, b) => featured.indexOf(a.slug) - featured.indexOf(b.slug))
    .map((collection) => ({
      name: collection.name,
      href: `/collections/${collection.slug}`,
      imageSrc: collection.imageSrc,
      description: collection.description,
    }));
}

const FEATURED_SLUGS = ["silk-wrap-dress", "cashmere-crewneck", "leather-tote", "santal-parfum"];

/** The homepage "Featured pieces" edit. */
export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((product) => FEATURED_SLUGS.includes(product.slug));
  return (featured.length > 0 ? featured : products).slice(0, 4);
}

const BEST_SELLER_SLUGS = [
  "wool-overcoat",
  "silk-scarf-dune",
  "pleated-midi-skirt",
  "suede-loafers",
];

/** The homepage best-seller rail — same curated set as the original edit. */
export async function getBestSellers(): Promise<Product[]> {
  const products = await getProducts();
  const curated = BEST_SELLER_SLUGS.map((slug) =>
    products.find((product) => product.slug === slug)
  ).filter((product): product is Product => Boolean(product));
  if (curated.length > 0) return curated;
  const badged = products.filter((product) => product.badge === "Best Seller");
  return (badged.length > 0 ? badged : products).slice(0, 4);
}
