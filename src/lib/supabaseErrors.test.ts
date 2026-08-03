import { describe, expect, it, vi } from "vitest";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { resolveErrorMessage } from "./supabaseErrors";

describe("resolveErrorMessage", () => {
  it("prefers the error message from the response data", async () => {
    const message = await resolveErrorMessage({ error: "Cupom inválido" }, null);
    expect(message).toBe("Cupom inválido");
  });

  it("extracts the error from a FunctionsHttpError body when data has none", async () => {
    const context = {
      json: vi.fn().mockResolvedValue({ error: "Estoque insuficiente" }),
    } as unknown as Response;
    const invokeError = new FunctionsHttpError(context);

    const message = await resolveErrorMessage(null, invokeError);
    expect(message).toBe("Estoque insuficiente");
  });

  it("falls back to the generic Error message when the body has no error field", async () => {
    const context = {
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Response;
    const invokeError = new FunctionsHttpError(context);

    const message = await resolveErrorMessage(null, invokeError);
    expect(message).toBe(invokeError.message);
  });

  it("falls back to the generic Error message when the body isn't valid JSON", async () => {
    const context = {
      json: vi.fn().mockRejectedValue(new Error("not json")),
    } as unknown as Response;
    const invokeError = new FunctionsHttpError(context);

    const message = await resolveErrorMessage(null, invokeError);
    expect(message).toBe(invokeError.message);
  });

  it("returns a generic message for a non-Error, non-FunctionsHttpError value", async () => {
    const message = await resolveErrorMessage(null, "some string thrown");
    expect(message).toBe("Erro inesperado.");
  });
});
