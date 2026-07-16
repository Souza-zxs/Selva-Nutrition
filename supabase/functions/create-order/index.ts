import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { calculateShipping } from "../_shared/shipping.ts";
import { sendOrderReceivedEmail } from "../_shared/email.ts";

type CartLine = { product_id: string; qty: number };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lines, shipping_address, shipping, contact } =
      (await req.json()) as {
        lines: CartLine[];
        shipping_address: Record<string, unknown>;
        shipping: { service_id: string };
        contact: Record<string, unknown>;
      };

    if (!Array.isArray(lines) || lines.length === 0) {
      return json({ error: "Carrinho vazio" }, 400);
    }
    if (!shipping_address || !contact) {
      return json({ error: "Endereço e contato são obrigatórios" }, 400);
    }
    if (!shipping?.service_id) {
      return json({ error: "Selecione uma opção de frete" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Guest checkout is allowed — user_id stays null when there's no session.
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseAdmin.auth.getUser(token);
      userId = data.user?.id ?? null;
    }

    const productIds = lines.map((l) => l.product_id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, sale_price, is_featured, weight_kg, stock, active")
      .in("id", productIds);

    if (productsError) return json({ error: productsError.message }, 500);

    const productMap = new Map((products ?? []).map((p) => [p.id, p]));

    // Price/stock always come from the DB row here, never from the client —
    // this is the one place that closes the "cart price tampered in localStorage" hole.
    let subtotal = 0;
    let totalWeightKg = 0;
    const orderItems: {
      product_id: string;
      qty: number;
      unit_price: number;
      name: string;
    }[] = [];

    for (const line of lines) {
      const product = productMap.get(line.product_id);
      const qty = Number(line.qty);

      if (!product || !product.active) {
        return json(
          { error: `Produto indisponível: ${line.product_id}` },
          400,
        );
      }
      if (!Number.isInteger(qty) || qty <= 0) {
        return json({ error: "Quantidade inválida" }, 400);
      }
      if (product.stock < qty) {
        return json(
          { error: `Estoque insuficiente para ${product.name}` },
          400,
        );
      }

      const unitPrice =
        product.is_featured && product.sale_price != null
          ? product.sale_price
          : product.price;

      subtotal += unitPrice * qty;
      totalWeightKg += product.weight_kg * qty;
      orderItems.push({
        product_id: product.id,
        qty,
        unit_price: unitPrice,
        name: product.name,
      });
    }

    const zip = (shipping_address as { zip?: string }).zip ?? "";
    let shippingCost: number;
    let shippingServiceName: string;
    try {
      const quotes = calculateShipping(zip, totalWeightKg, subtotal);
      const quote = quotes.find((q) => q.id === shipping.service_id);
      if (!quote) {
        return json(
          { error: "Opção de frete inválida, recalcule o frete." },
          400,
        );
      }
      shippingCost = quote.price;
      shippingServiceName = quote.name;
    } catch (err) {
      return json(
        { error: err instanceof Error ? err.message : "CEP inválido" },
        400,
      );
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        subtotal,
        shipping_cost: shippingCost,
        shipping_service: shippingServiceName,
        shipping_address,
        contact,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) return json({ error: orderError.message }, 500);

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          qty: item.qty,
          unit_price: item.unit_price,
        })),
      );

    if (itemsError) return json({ error: itemsError.message }, 500);

    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

    // Best-effort: "pedido recebido" email + closing out any abandoned-cart
    // draft for this email. Neither should ever fail the checkout itself.
    const contactInfo = contact as { name?: string; email?: string };
    if (contactInfo.email) {
      try {
        await sendOrderReceivedEmail({
          to: contactInfo.email,
          customerName: contactInfo.name ?? "cliente",
          orderId: order.id,
          items: orderItems.map((item) => ({
            name: item.name,
            qty: item.qty,
            unitPrice: item.unit_price,
          })),
          subtotal,
          shippingCost,
          shippingServiceName,
          siteUrl,
        });
      } catch (err) {
        console.error("Erro ao enviar e-mail de pedido recebido", err);
      }

      try {
        await supabaseAdmin
          .from("abandoned_carts")
          .update({ recovered: true })
          .eq("email", contactInfo.email.trim().toLowerCase())
          .eq("recovered", false);
      } catch (err) {
        console.error("Erro ao marcar carrinho abandonado como recuperado", err);
      }
    }

    const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpAccessToken) {
      // Order is safely persisted as "pending" — payment provider just isn't wired up yet.
      return json(
        {
          error:
            "Mercado Pago não configurado (defina o secret MERCADOPAGO_ACCESS_TOKEN)",
          orderId: order.id,
        },
        500,
      );
    }

    const mpRes = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            ...orderItems.map((item) => ({
              title: item.name,
              quantity: item.qty,
              unit_price: item.unit_price,
              currency_id: "BRL",
            })),
            ...(shippingCost > 0
              ? [
                  {
                    title: `Frete - ${shippingServiceName}`,
                    quantity: 1,
                    unit_price: shippingCost,
                    currency_id: "BRL",
                  },
                ]
              : []),
          ],
          external_reference: order.id,
          back_urls: {
            success: `${siteUrl}/pedido/${order.id}`,
            pending: `${siteUrl}/pedido/${order.id}`,
            failure: `${siteUrl}/pedido/${order.id}`,
          },
          auto_return: "approved",
          notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
        }),
      },
    );

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      return json(
        {
          error:
            mpData.message ?? "Erro ao criar preferência no Mercado Pago",
          orderId: order.id,
        },
        502,
      );
    }

    await supabaseAdmin
      .from("orders")
      .update({ mp_preference_id: mpData.id })
      .eq("id", order.id);

    return json({
      orderId: order.id,
      initPoint: mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point,
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
