import { describe, expect, it } from "vitest";
import {
  computeDiscount,
  couponEligibilityError,
  normalizeCouponCode,
  type CouponRow,
} from "./coupon";

function makeCoupon(overrides: Partial<CouponRow> = {}): CouponRow {
  return {
    code: "PROMO10",
    discount_type: "percent",
    discount_value: 10,
    active: true,
    min_subtotal: 0,
    expires_at: null,
    usage_limit: null,
    used_count: 0,
    ...overrides,
  };
}

describe("normalizeCouponCode", () => {
  it("uppercases and trims the code", () => {
    expect(normalizeCouponCode("  promo10 ")).toBe("PROMO10");
  });
});

describe("couponEligibilityError", () => {
  it("rejects when the coupon doesn't exist", () => {
    expect(couponEligibilityError(null, 100)).toBe("Cupom inválido");
  });

  it("rejects an inactive coupon", () => {
    const coupon = makeCoupon({ active: false });
    expect(couponEligibilityError(coupon, 100)).toBe("Cupom inativo");
  });

  it("rejects an expired coupon", () => {
    const coupon = makeCoupon({ expires_at: "2020-01-01T00:00:00Z" });
    expect(couponEligibilityError(coupon, 100)).toBe("Cupom expirado");
  });

  it("accepts a coupon that hasn't expired yet", () => {
    const coupon = makeCoupon({ expires_at: "2999-01-01T00:00:00Z" });
    expect(couponEligibilityError(coupon, 100)).toBeNull();
  });

  it("rejects when subtotal is below the minimum", () => {
    const coupon = makeCoupon({ min_subtotal: 200 });
    expect(couponEligibilityError(coupon, 100)).toBe(
      "Válido a partir de R$ 200.00 em produtos",
    );
  });

  it("rejects when the usage limit has been reached", () => {
    const coupon = makeCoupon({ usage_limit: 5, used_count: 5 });
    expect(couponEligibilityError(coupon, 100)).toBe("Cupom esgotado");
  });

  it("accepts when usage is below the limit", () => {
    const coupon = makeCoupon({ usage_limit: 5, used_count: 4 });
    expect(couponEligibilityError(coupon, 100)).toBeNull();
  });

  it("accepts a valid, active, unlimited coupon", () => {
    const coupon = makeCoupon();
    expect(couponEligibilityError(coupon, 100)).toBeNull();
  });
});

describe("computeDiscount", () => {
  it("computes a percent discount", () => {
    const coupon = makeCoupon({ discount_type: "percent", discount_value: 10 });
    expect(computeDiscount(coupon, 100)).toBe(10);
  });

  it("computes a fixed discount", () => {
    const coupon = makeCoupon({ discount_type: "fixed", discount_value: 15 });
    expect(computeDiscount(coupon, 100)).toBe(15);
  });

  it("caps a fixed discount at the subtotal so total never goes negative", () => {
    const coupon = makeCoupon({ discount_type: "fixed", discount_value: 500 });
    expect(computeDiscount(coupon, 100)).toBe(100);
  });

  it("rounds the discount to two decimal places", () => {
    const coupon = makeCoupon({ discount_type: "percent", discount_value: 33.333 });
    expect(computeDiscount(coupon, 10)).toBe(3.33);
  });
});
