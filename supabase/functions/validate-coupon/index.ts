import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import {
  computeDiscount,
  couponEligibilityError,
  normalizeCouponCode,
} from "../_shared/coupon.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, subtotal } = (await req.json()) as {
      code: string;
      subtotal: number;
    };

    if (!code || typeof subtotal !== "number") {
      return json({ error: "Código e subtotal são obrigatórios" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", normalizeCouponCode(code))
      .maybeSingle();

    const eligibilityError = couponEligibilityError(coupon, subtotal);
    if (eligibilityError) {
      return json({ error: eligibilityError }, 400);
    }

    return json({
      code: coupon!.code,
      discount_amount: computeDiscount(coupon!, subtotal),
    });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Erro inesperado" },
      500,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
