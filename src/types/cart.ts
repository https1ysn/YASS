import type { Product } from "./product";

/** A line in the shopping bag — static placeholder shape until real cart state exists. */
export interface CartLine {
  id: string;
  product: Product;
  quantity: number;
  size: string;
  /** Filter-swatch value — see filterColors in constants/shop. */
  color: string;
}
