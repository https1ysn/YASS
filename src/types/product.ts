export type Availability = "in-stock" | "made-to-order";

export interface Product {
  slug: string;
  name: string;
  href: string;
  imageSrc: string;
  imageAlt?: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  badge?: string;
  description: string;
  /** Filter-swatch values — see filterColors in constants/shop. */
  colors: string[];
  sizes: string[];
  availability: Availability;
  /** Collection slugs this product belongs to. */
  collections: string[];
  /** Static placeholder rating (0–5). */
  rating: number;
  reviewCount: number;
  /** Full gallery (from product_images) — falls back to the derived gallery. */
  galleryImages?: string[];
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Collection {
  slug: string;
  name: string;
  description: string;
  imageSrc: string;
  pieceCount: number;
  comingSoon?: boolean;
}
