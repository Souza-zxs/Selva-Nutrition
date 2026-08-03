import { describe, expect, it } from "vitest";
import { formatBRL } from "./currency";

describe("formatBRL", () => {
  it("formats a whole number as BRL", () => {
    expect(formatBRL(100)).toBe("R$ 100,00");
  });

  it("formats cents correctly", () => {
    expect(formatBRL(79.9)).toBe("R$ 79,90");
  });

  it("formats zero", () => {
    expect(formatBRL(0)).toBe("R$ 0,00");
  });

  it("formats negative values (discounts)", () => {
    expect(formatBRL(-20)).toBe("-R$ 20,00");
  });

  it("uses thousands separator", () => {
    expect(formatBRL(1234.5)).toBe("R$ 1.234,50");
  });
});
