import { FunctionsHttpError } from "@supabase/supabase-js";

export async function resolveErrorMessage(
  data: { error?: string } | null,
  invokeError: unknown,
): Promise<string> {
  if (data?.error) return data.error;
  if (invokeError instanceof FunctionsHttpError) {
    try {
      const body = await invokeError.context.json();
      if (body?.error) return body.error as string;
    } catch {
      // fall through to the generic message below
    }
  }
  return invokeError instanceof Error
    ? invokeError.message
    : "Erro inesperado.";
}
