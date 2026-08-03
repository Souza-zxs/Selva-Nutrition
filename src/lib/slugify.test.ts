import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Manteiga Tallow")).toBe("manteiga-tallow");
  });

  it("strips accents", () => {
    expect(slugify("Hidratante Facial Tallow")).toBe("hidratante-facial-tallow");
    expect(slugify("Ghee Tradicional — Ayurveda")).toBe("ghee-tradicional-ayurveda");
  });

  it("removes accented characters like ã, ç, é", () => {
    expect(slugify("Não é açúcar")).toBe("nao-e-acucar");
  });

  it("collapses consecutive separators into a single hyphen", () => {
    expect(slugify("Kit 2x  Tallow!!  Premium")).toBe("kit-2x-tallow-premium");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -- Ghee Ervas Finas -- ")).toBe("ghee-ervas-finas");
  });

  it("handles an already-slug-like string unchanged", () => {
    expect(slugify("tallow-texana")).toBe("tallow-texana");
  });
});
