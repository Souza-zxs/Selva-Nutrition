import { describe, expect, it } from "vitest";
import { discountPercent, effectivePrice } from "./pricing";
import type { Product } from "../types/product";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "1",
    slug: "produto",
    tag: null,
    name: "Produto",
    body: null,
    price: 100,
    stock: 10,
    active: true,
    weight_kg: 0.3,
    is_featured: false,
    sale_price: null,
    ...overrides,
  };
}

describe("effectivePrice", () => {
  it("returns the regular price when the product isn't featured", () => {
    const product = makeProduct({ is_featured: false, sale_price: 80 });
    expect(effectivePrice(product)).toBe(100);
  });

  it("returns the regular price when there is no sale price", () => {
    const product = makeProduct({ is_featured: true, sale_price: null });
    expect(effectivePrice(product)).toBe(100);
  });

  it("returns the sale price when featured with a sale price set", () => {
    const product = makeProduct({ is_featured: true, sale_price: 80 });
    expect(effectivePrice(product)).toBe(80);
  });
});

describe("discountPercent", () => {
  it("returns null when not featured", () => {
    const product = makeProduct({ is_featured: false, sale_price: 80 });
    expect(discountPercent(product)).toBeNull();
  });

  it("returns null when there is no sale price", () => {
    const product = makeProduct({ is_featured: true, sale_price: null });
    expect(discountPercent(product)).toBeNull();
  });

  it("computes the rounded percentage off", () => {
    const product = makeProduct({ price: 100, is_featured: true, sale_price: 80 });
    expect(discountPercent(product)).toBe(20);
  });

  it("rounds to the nearest integer percent", () => {
    const product = makeProduct({ price: 79.9, is_featured: true, sale_price: 69.9 });
    expect(discountPercent(product)).toBe(13);
  });
});
