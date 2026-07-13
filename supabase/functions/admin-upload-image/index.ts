import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return json({ error: "Nenhum arquivo enviado" }, 400);
    }

    const ext = file.name.split(".").pop() ?? "webp";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("products")
      .upload(path, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      return json({ error: uploadError.message }, 500);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("products")
      .getPublicUrl(path);

    return json({ url: publicUrlData.publicUrl });
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
