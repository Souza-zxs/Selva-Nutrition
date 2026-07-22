export type ViaCepAddress = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

// ViaCEP é público e gratuito, sem chave — usado só para preencher o
// endereço a partir do CEP que o cliente já digita pro cálculo de frete.
export async function lookupCep(
  cepDigits: string,
): Promise<ViaCepAddress | null> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    };
  } catch {
    return null;
  }
}
