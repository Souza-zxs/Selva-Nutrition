import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { sendCartRecoveryEmail } from "../_shared/email.ts";

const FIRST_REMINDER_AFTER_HOURS = 3;
const FINAL_REMINDER_AFTER_DAYS = 7;

type AbandonedCart = {
  id: string;
  email: string;
  name: string | null;
  lines: { product_id: string; qty: number }[];
};

/**
 * Disparado periodicamente pelo pg_cron/pg_net (ver a migration que cria
 * abandoned_carts) — nunca é chamado por um cliente com JWT do Supabase, daí
 * a checagem de segredo compartilhado abaixo em vez de verify_jwt.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && req.headers.get("x-cron-secret") !== cronSecret) {
    return new Response("unauthorized", { status: 401, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

    const firstCutoff = new Date(
      Date.now() - FIRST_REMINDER_AFTER_HOURS * 60 * 60 * 1000,
    ).toISOString();
    const finalCutoff = new Date(
      Date.now() - FINAL_REMINDER_AFTER_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: firstBatch } = await supabaseAdmin
      .from("abandoned_carts")
      .select("id, email, name, lines")
      .eq("recovered", false)
      .eq("reminder_stage", 0)
      .lte("created_at", firstCutoff);

    const { data: finalBatch } = await supabaseAdmin
      .from("abandoned_carts")
      .select("id, email, name, lines")
      .eq("recovered", false)
      .eq("reminder_stage", 1)
      .lte("created_at", finalCutoff);

    let sent = 0;
    for (const cart of (firstBatch ?? []) as AbandonedCart[]) {
      if (await remindCart(supabaseAdmin, cart, siteUrl, false)) sent++;
    }
    for (const cart of (finalBatch ?? []) as AbandonedCart[]) {
      if (await remindCart(supabaseAdmin, cart, siteUrl, true)) sent++;
    }

    return json({ ok: true, sent });
  } catch (err) {
    console.error("Erro ao processar lembretes de carrinho abandonado", err);
    return json({ error: "Erro inesperado" }, 500);
  }
});

async function remindCart(
  // deno-lint-ignore no-explicit-any
  supabaseAdmin: any,
  cart: AbandonedCart,
  siteUrl: string,
  isFinalReminder: boolean,
): Promise<boolean> {
  try {
    const productIds = cart.lines.map((l) => l.product_id);
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name")
      .in("id", productIds);
    const productMap = new Map(
      (products ?? []).map((p: { id: string; name: string }) => [p.id, p.name]),
    );

    const items = cart.lines
      .filter((l) => productMap.has(l.product_id))
      .map((l) => ({ name: productMap.get(l.product_id) as string, qty: l.qty }));

    if (items.length === 0) {
      // Every product in this draft is gone (deleted/unpublished) — nothing sensible to remind about.
      await supabaseAdmin
        .from("abandoned_carts")
        .update({ recovered: true })
        .eq("id", cart.id);
      return false;
    }

    await sendCartRecoveryEmail({
      to: cart.email,
      customerName: cart.name,
      items,
      siteUrl,
      isFinalReminder,
    });

    await supabaseAdmin
      .from("abandoned_carts")
      .update(
        isFinalReminder
          ? { reminder_stage: 2, second_reminder_at: new Date().toISOString() }
          : { reminder_stage: 1, first_reminder_at: new Date().toISOString() },
      )
      .eq("id", cart.id);

    return true;
  } catch (err) {
    console.error(`Erro ao lembrar carrinho ${cart.id}`, err);
    return false;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
