// Calculadora de frete própria: zona por prefixo de CEP + peso total do carrinho.
// Sem dependência de API externa. Origem assumida: São Paulo (zonas 0/1 mais baratas).

export type ShippingQuote = {
  id: string;
  name: string;
  price: number;
  etaDays: number;
};

type Zone = {
  label: string;
  base: number;
  perKg: number;
  etaFast: number;
  etaSlow: number;
};

export const FREE_SHIPPING_THRESHOLD = 300;

const ZONES: Record<string, Zone> = {
  "0": { label: "São Paulo - Capital/Região", base: 12.9, perKg: 3.5, etaFast: 2, etaSlow: 4 },
  "1": { label: "São Paulo - Interior", base: 15.9, perKg: 3.8, etaFast: 3, etaSlow: 5 },
  "2": { label: "Rio de Janeiro / Espírito Santo", base: 19.9, perKg: 4.2, etaFast: 3, etaSlow: 6 },
  "3": { label: "Minas Gerais", base: 17.9, perKg: 4.0, etaFast: 3, etaSlow: 6 },
  "4": { label: "Bahia / Sergipe", base: 27.9, perKg: 5.2, etaFast: 5, etaSlow: 9 },
  "5": { label: "Pernambuco / Alagoas / Paraíba / RN", base: 29.9, perKg: 5.5, etaFast: 6, etaSlow: 10 },
  "6": { label: "Norte / Nordeste", base: 34.9, perKg: 6.2, etaFast: 7, etaSlow: 12 },
  "7": { label: "Distrito Federal / Centro-Oeste", base: 22.9, perKg: 4.6, etaFast: 4, etaSlow: 7 },
  "8": { label: "Paraná / Santa Catarina", base: 16.9, perKg: 3.9, etaFast: 3, etaSlow: 5 },
  "9": { label: "Rio Grande do Sul", base: 18.9, perKg: 4.1, etaFast: 4, etaSlow: 6 },
};

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateShipping(
  cepRaw: string,
  totalWeightKg: number,
  subtotal: number,
): ShippingQuote[] {
  const cep = onlyDigits(cepRaw);
  if (cep.length !== 8) {
    throw new Error("CEP inválido");
  }
  const zone = ZONES[cep[0]];
  if (!zone) {
    throw new Error("CEP inválido");
  }

  const weight = Math.max(totalWeightKg, 0.3);
  const economyRaw = zone.base + zone.perKg * weight;
  const expressRaw = zone.base * 1.6 + zone.perKg * 1.3 * weight;
  const freeEligible = subtotal >= FREE_SHIPPING_THRESHOLD;

  return [
    {
      id: "economico",
      name: `Econômico — ${zone.label}`,
      price: freeEligible ? 0 : round2(economyRaw),
      etaDays: zone.etaSlow,
    },
    {
      id: "expresso",
      name: `Expresso — ${zone.label}`,
      price: round2(expressRaw),
      etaDays: zone.etaFast,
    },
  ];
}
