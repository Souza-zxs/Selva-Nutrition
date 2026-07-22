// Identificação legal da empresa — exigida por lei em rodapé, Termos de Uso,
// Política de Privacidade e Política de Trocas (CDC art. 31 e correlatos).
// Preencher com os dados reais antes de publicar a loja: sem isso, os
// documentos legais ficam incompletos e o Mercado Pago pode suspender a
// conta de recebimento por falta de identificação do vendedor.
export const COMPANY = {
  legalName: "", // Razão social (ou nome completo, se MEI/pessoa física)
  cnpj: "", // CNPJ (ou CPF, se pessoa física/MEI)
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip: "",
  },
  supportEmail: "contatoselvanutrition@gmail.com",
  whatsapp: "", // formato +55DDDNÚMERO, opcional
};

export function isCompanyInfoComplete(): boolean {
  return Boolean(
    COMPANY.legalName &&
      COMPANY.cnpj &&
      COMPANY.address.street &&
      COMPANY.address.city &&
      COMPANY.address.state &&
      COMPANY.address.zip,
  );
}

export function formatCompanyAddress(): string {
  const a = COMPANY.address;
  if (!a.street) return "";
  const line1 = `${a.street}, ${a.number}${a.complement ? ` — ${a.complement}` : ""}`;
  const line2 = `${a.neighborhood} — ${a.city}/${a.state} — CEP ${a.zip}`;
  return `${line1}, ${line2}`;
}
