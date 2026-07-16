import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type CartLine = { product_id: string; qty: number };

/**
 * Rascunho de carrinho salvo silenciosamente quando o cliente informa o
 * e-mail no checkout, antes de finalizar a compra — é o que alimenta o
 * lembrete de carrinho abandonado (send-cart-recovery-emails). Nunca deve
 * travar o checkout: o front-end chama isso em "fire and forget".
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, lines } = (await req.json()) as {
      email: string;
      name?: string;
      lines: CartLine[];
    };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "E-mail inválido" }, 400);
    }
    if (!Array.isArray(lines)) {
      return json({ error: "Carrinho inválido" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing } = await supabaseAdmin
      .from("abandoned_carts")
      .select("id")
      .eq("email", normalizedEmail)
      .eq("recovered", false)
      .maybeSingle();

    // Cart emptied out after the draft was saved — nothing left to remind about.
    if (lines.length === 0) {
      if (existing) {
        await supabaseAdmin
          .from("abandoned_carts")
          .delete()
          .eq("id", existing.id);
      }
      return json({ ok: true });
    }

    if (existing) {
      // Any further activity on this cart resets the abandonment clock.
      await supabaseAdmin
        .from("abandoned_carts")
        .update({
          name: name ?? null,
          lines,
          reminder_stage: 0,
          first_reminder_at: null,
          second_reminder_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("abandoned_carts").insert({
        email: normalizedEmail,
        name: name ?? null,
        lines,
      });
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
