import { corsHeaders } from "../_shared/cors.ts";
import { calculateShipping } from "../_shared/shipping.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cep, weight_kg, subtotal } = (await req.json()) as {
      cep: string;
      weight_kg: number;
      subtotal: number;
    };

    if (!cep || typeof weight_kg !== "number" || typeof subtotal !== "number") {
      return json({ error: "cep, weight_kg e subtotal são obrigatórios" }, 400);
    }

    const quotes = calculateShipping(cep, weight_kg, subtotal);
    return json({ quotes });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Erro inesperado" },
      400,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
