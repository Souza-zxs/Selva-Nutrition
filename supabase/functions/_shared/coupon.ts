export type CouponRow = {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
  min_subtotal: number;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
};

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export function couponEligibilityError(
  coupon: CouponRow | null | undefined,
  subtotal: number,
): string | null {
  if (!coupon) return "Cupom inválido";
  if (!coupon.active) return "Cupom inativo";
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return "Cupom expirado";
  }
  if (subtotal < coupon.min_subtotal) {
    return `Válido a partir de R$ ${coupon.min_subtotal.toFixed(2)} em produtos`;
  }
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
    return "Cupom esgotado";
  }
  return null;
}

export function computeDiscount(coupon: CouponRow, subtotal: number): number {
  const raw =
    coupon.discount_type === "percent"
      ? subtotal * (coupon.discount_value / 100)
      : coupon.discount_value;
  return Math.min(Math.round(raw * 100) / 100, subtotal);
}
