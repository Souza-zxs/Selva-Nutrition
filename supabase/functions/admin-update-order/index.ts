import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { sendOrderCancelledEmail, sendOrderShippedEmail } from "../_shared/email.ts";

const STATUSES = ["pending", "paid", "failed", "cancelled", "shipped"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Não autenticado" }, 401);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return json({ error: "Não autenticado" }, 401);
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profile?.role !== "admin") {
      return json({ error: "Acesso restrito a administradores" }, 403);
    }

    const { orderId, status, tracking_code } = (await req.json()) as {
      orderId: string;
      status: string;
      tracking_code?: string | null;
    };

    if (!orderId || !STATUSES.includes(status)) {
      return json({ error: "Pedido ou status inválido" }, 400);
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, status, contact, created_at")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return json({ error: "Pedido não encontrado" }, 404);
    }

    const previousStatus = order.status as string;
    const contact = order.contact as { name?: string; email?: string } | null;
    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

    const update: Record<string, unknown> = { status };
    if (tracking_code !== undefined) update.tracking_code = tracking_code;

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update(update)
      .eq("id", orderId);

    if (updateError) return json({ error: updateError.message }, 500);

    // Um pedido só chega a decrementar estoque depois de "paid" (webhook do
    // MP) — se ele volta pra cancelled/failed depois disso, o estoque
    // reservado precisa voltar, senão fica perdido pra sempre.
    const wasPaid = previousStatus === "paid";
    const cancelledAfterPaid =
      wasPaid && (status === "cancelled" || status === "failed");

    if (cancelledAfterPaid) {
      const { error: restockError } = await supabaseAdmin.rpc(
        "restock_order",
        { p_order_id: orderId },
      );
      if (restockError) {
        console.error("Erro ao devolver estoque", restockError);
      }

      if (contact?.email) {
        try {
          await sendOrderCancelledEmail({
            to: contact.email,
            customerName: contact.name ?? "cliente",
            orderId,
            createdAt: order.created_at,
            siteUrl,
          });
        } catch (err) {
          console.error("Erro ao enviar e-mail de cancelamento", err);
        }
      }
    }

    const newlyShipped = status === "shipped" && previousStatus !== "shipped";
    if (newlyShipped && contact?.email) {
      try {
        await sendOrderShippedEmail({
          to: contact.email,
          customerName: contact.name ?? "cliente",
          orderId,
          createdAt: order.created_at,
          trackingCode: tracking_code ?? null,
          siteUrl,
        });
      } catch (err) {
        console.error("Erro ao enviar e-mail de envio", err);
      }
    }

    return json({ ok: true });
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
