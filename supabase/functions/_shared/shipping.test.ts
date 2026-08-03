import { describe, expect, it } from "vitest";
import { calculateShipping, onlyDigits, FREE_SHIPPING_THRESHOLD } from "./shipping";

describe("onlyDigits", () => {
  it("strips non-digit characters from a formatted CEP", () => {
    expect(onlyDigits("01310-100")).toBe("01310100");
  });

  it("returns an empty string for a CEP with no digits", () => {
    expect(onlyDigits("abc-def")).toBe("");
  });
});

describe("calculateShipping", () => {
  it("throws for a CEP that isn't 8 digits", () => {
    expect(() => calculateShipping("1234", 1, 100)).toThrow("CEP inválido");
  });

  it("throws for an empty CEP", () => {
    expect(() => calculateShipping("", 1, 100)).toThrow("CEP inválido");
  });

  it("returns economico and expresso quotes for a valid CEP", () => {
    const quotes = calculateShipping("01310-100", 1, 100);
    expect(quotes).toHaveLength(2);
    expect(quotes.map((q) => q.id)).toEqual(["economico", "expresso"]);
  });

  it("applies a minimum billable weight of 0.3kg", () => {
    const heavier = calculateShipping("01310-100", 5, 100);
    const lighter = calculateShipping("01310-100", 0.01, 100);
    const zeroWeight = calculateShipping("01310-100", 0, 100);
    expect(lighter[0].price).toBe(zeroWeight[0].price);
    expect(heavier[0].price).toBeGreaterThan(lighter[0].price);
  });

  it("makes the economy option free at or above the free shipping threshold", () => {
    const belowThreshold = calculateShipping("01310-100", 1, FREE_SHIPPING_THRESHOLD - 0.01);
    const atThreshold = calculateShipping("01310-100", 1, FREE_SHIPPING_THRESHOLD);
    expect(belowThreshold[0].price).toBeGreaterThan(0);
    expect(atThreshold[0].price).toBe(0);
  });

  it("never makes the express option free, even above the threshold", () => {
    const quotes = calculateShipping("01310-100", 1, FREE_SHIPPING_THRESHOLD);
    expect(quotes[1].price).toBeGreaterThan(0);
  });

  it("charges more for a farther shipping zone with the same weight", () => {
    const nearby = calculateShipping("01310-100", 1, 100); // zone 0 - São Paulo capital
    const farAway = calculateShipping("69900-000", 1, 100); // zone 6 - Norte/Nordeste
    expect(farAway[0].price).toBeGreaterThan(nearby[0].price);
  });
});
