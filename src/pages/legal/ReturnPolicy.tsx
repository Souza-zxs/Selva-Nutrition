import { COMPANY, formatCompanyAddress } from "../../data/company";
import LegalLayout from "../../components/legal/LegalLayout";

export default function ReturnPolicy() {
  const address = formatCompanyAddress();

  return (
    <LegalLayout
      eyebrow="Legal"
      title="Trocas e Devoluções"
      updatedAt="20 de julho de 2026"
    >
      <p>
        Esta política segue o Código de Defesa do Consumidor (Lei 8.078/1990),
        em especial o direito de arrependimento previsto no art. 49 para
        compras feitas fora do estabelecimento comercial, como é o caso desta
        loja online.
      </p>

      <h2>Direito de arrependimento (7 dias)</h2>
      <p>
        Você tem até <strong>7 dias corridos</strong> a partir da data de
        recebimento do produto para desistir da compra, sem precisar
        justificar o motivo. Nesse caso, você tem direito à devolução
        integral do valor pago, incluindo o frete de envio original, e{" "}
        <strong>não paga pelo frete de devolução</strong> — o custo de envio
        de volta corre por nossa conta.
      </p>
      <p>
        Para exercer esse direito, o produto precisa estar{" "}
        <strong>lacrado e sem uso</strong>. Como os produtos Selva Nutrition
        são itens de consumo (alimentícios e de higiene/skincare), o
        arrependimento só é aceito se o lacre original não tiver sido violado
        — depois de aberto, o produto não pode mais ser devolvido por esse
        motivo, por questões sanitárias.
      </p>

      <h2>Produto com defeito ou avaria</h2>
      <p>
        Se o produto chegar com defeito, vazamento, avaria de transporte ou
        divergente do que foi pedido, você tem até{" "}
        <strong>30 dias corridos</strong> a partir do recebimento para
        solicitar troca ou reembolso integral, incluindo o frete — nesse caso
        vale mesmo com o produto aberto, já que o problema é de qualidade do
        item, não de arrependimento da compra.
      </p>

      <h2>Como solicitar</h2>
      <p>
        Envie um e-mail para{" "}
        <a
          href={`mailto:${COMPANY.supportEmail}`}
          className="text-secondary hover:underline"
        >
          {COMPANY.supportEmail}
        </a>{" "}
        com o número do seu pedido (disponível na página do pedido ou no
        e-mail de confirmação), o motivo da solicitação e fotos do produto
        quando se tratar de defeito ou avaria. Respondemos com as instruções
        de envio — inclusive a etiqueta ou o reembolso do frete de devolução,
        quando aplicável.
      </p>

      <h2>Prazo e forma de reembolso</h2>
      <p>
        Depois de recebermos e conferirmos o produto devolvido, o reembolso é
        processado em até <strong>10 dias úteis</strong>, sempre pelo mesmo
        meio de pagamento usado na compra (Mercado Pago). O prazo para o
        valor aparecer no seu extrato ou fatura depende do seu banco ou
        operadora de cartão.
      </p>

      {address && (
        <>
          <h2>Endereço para devolução</h2>
          <p>{address}</p>
        </>
      )}
    </LegalLayout>
  );
}
