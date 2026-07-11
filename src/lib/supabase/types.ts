/** Row shapes for the tables this app reads. Matches supabase/migrations. */

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_coming_soon: boolean;
  sort_order: number;
}

export interface ProductImageRow {
  url: string;
  alt: string | null;
  sort_order: number;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  badge: string | null;
  colors: string[] | null;
  sizes: string[] | null;
  availability: string;
  collection_slugs: string[] | null;
  rating: number | string | null;
  review_count: number | null;
  category: Pick<CategoryRow, "slug" | "name"> | null;
  images: ProductImageRow[] | null;
}
