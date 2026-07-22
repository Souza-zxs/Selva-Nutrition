import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { sendOrderPaidEmail } from "../_shared/email.ts";

const STATUS_MAP: Record<string, string> = {
  approved: "paid",
  rejected: "failed",
  cancelled: "cancelled",
  refunded: "cancelled",
  charged_back: "cancelled",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Mercado Pago always expects a 2xx quickly, or it retries — never throw past this point.
  try {
    const url = new URL(req.url);
    let paymentId =
      url.searchParams.get("id") ?? url.searchParams.get("data.id");
    const topic = url.searchParams.get("topic") ?? url.searchParams.get("type");

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      if (body?.data?.id) paymentId = String(body.data.id);
    }

    if (!paymentId || (topic && topic !== "payment")) {
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpAccessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN não configurado");
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    // Fetch the payment from Mercado Pago's API rather than trusting the webhook
    // payload's own status field — the payload is just a pointer to go look it up.
    const paymentRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${mpAccessToken}` } },
    );

    if (!paymentRes.ok) {
      console.error("Falha ao consultar pagamento", await paymentRes.text());
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    const payment = await paymentRes.json();
    const orderId = payment.external_reference;
    const newStatus = STATUS_MAP[payment.status] ?? "pending";

    if (!orderId) {
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "id, status, contact, subtotal, shipping_cost, shipping_service, coupon_code",
      )
      .eq("id", orderId)
      .single();

    if (!order) {
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    await supabaseAdmin
      .from("orders")
      .update({ status: newStatus, mp_payment_id: String(payment.id) })
      .eq("id", orderId);

    // Decrement stock and send confirmation email exactly once, only on the pending -> paid transition.
    if (newStatus === "paid" && order.status !== "paid") {
      const { data: items } = await supabaseAdmin
        .from("order_items")
        .select("product_id, qty, unit_price, products(name)")
        .eq("order_id", orderId);

      for (const item of items ?? []) {
        await supabaseAdmin.rpc("decrement_stock", {
          p_product_id: item.product_id,
          p_qty: item.qty,
        });
      }

      if (order.coupon_code) {
        await supabaseAdmin.rpc("increment_coupon_usage", {
          p_code: order.coupon_code,
        });
      }

      const contact = order.contact as { name?: string; email?: string } | null;
      if (contact?.email) {
        try {
          await sendOrderPaidEmail({
            to: contact.email,
            customerName: contact.name ?? "cliente",
            orderId: order.id,
            items: (items ?? []).map((item) => ({
              name: (item.products as { name?: string } | null)?.name ?? "Produto",
              qty: item.qty,
              unitPrice: item.unit_price,
            })),
            subtotal: order.subtotal,
            shippingCost: order.shipping_cost,
            shippingServiceName: order.shipping_service,
            siteUrl: Deno.env.get("SITE_URL") ?? "http://localhost:5173",
          });
        } catch (err) {
          console.error("Erro ao enviar e-mail de confirmação", err);
        }
      }
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Webhook error", err);
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
});
