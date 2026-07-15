import type { Product } from "../types/product";

export function effectivePrice(product: Product): number {
  return product.is_featured && product.sale_price != null
    ? product.sale_price
    : product.price;
}

export function discountPercent(product: Product): number | null {
  if (!product.is_featured || product.sale_price == null) return null;
  return Math.round((1 - product.sale_price / product.price) * 100);
}
