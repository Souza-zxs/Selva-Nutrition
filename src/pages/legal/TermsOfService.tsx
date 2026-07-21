import { Link } from "react-router-dom";
import { COMPANY, formatCompanyAddress, isCompanyInfoComplete } from "../../data/company";
import LegalLayout from "../../components/legal/LegalLayout";

export default function TermsOfService() {
  const address = formatCompanyAddress();
  const complete = isCompanyInfoComplete();

  return (
    <LegalLayout
      eyebrow="Legal"
      title="Termos de Uso"
      updatedAt="20 de julho de 2026"
    >
      <h2>Quem somos</h2>
      <p>
        A Selva Nutrition{" "}
        {complete
          ? <>é operada por <strong>{COMPANY.legalName}</strong>, inscrita no CNPJ {COMPANY.cnpj}, com sede em {address}.</>
          : <em>(identificação legal completa em preenchimento)</em>}
        {" "}Estes Termos regem o uso deste site e a compra dos produtos aqui
        oferecidos.
      </p>

      <h2>Cadastro e conta</h2>
      <p>
        Você pode comprar sem criar conta (checkout como visitante) ou
        cadastrar-se com e-mail e senha. Ao se cadastrar, você é responsável
        por manter suas credenciais em sigilo e por todas as ações realizadas
        na sua conta.
      </p>

      <h2>Pedidos e pagamento</h2>
      <p>
        Os preços exibidos estão em reais (R$) e podem ser alterados sem
        aviso prévio até a confirmação do pedido — depois de confirmado, o
        valor pago não muda. O frete é calculado com base no CEP de entrega e
        no peso dos itens, e é exibido antes da finalização da compra.
      </p>
      <p>
        Os pagamentos são processados pelo Mercado Pago, que aceita cartão de
        crédito, Pix e boleto conforme disponibilidade. A confirmação do
        pedido depende da aprovação do pagamento pelo Mercado Pago; pedidos
        não aprovados são cancelados automaticamente.
      </p>

      <h2>Entrega</h2>
      <p>
        O prazo estimado de entrega é informado no checkout no momento da
        escolha do frete e conta a partir da confirmação do pagamento. Prazos
        podem variar por fatores fora do nosso controle (transportadora,
        clima, greves).
      </p>

      <h2>Trocas e devoluções</h2>
      <p>
        Consulte nossa{" "}
        <Link to="/trocas-e-devolucoes" className="text-secondary hover:underline">
          Política de Trocas e Devoluções
        </Link>{" "}
        para prazos e condições de arrependimento e troca por defeito.
      </p>

      <h2>Propriedade intelectual</h2>
      <p>
        Todo o conteúdo deste site — textos, imagens, identidade visual,
        marca Selva Nutrition — é protegido por direitos autorais e não pode
        ser reproduzido sem autorização.
      </p>

      <h2>Limitação de responsabilidade</h2>
      <p>
        Os produtos Selva Nutrition não substituem orientação médica ou
        nutricional profissional. Consulte um profissional de saúde antes de
        iniciar o uso, especialmente em caso de condições pré-existentes,
        gravidez ou amamentação.
      </p>

      <h2>Foro</h2>
      <p>
        Fica eleito o foro da comarca do domicílio do consumidor para dirimir
        eventuais controvérsias, conforme o Código de Defesa do Consumidor.
      </p>

      <h2>Contato</h2>
      <p>
        Dúvidas sobre estes Termos:{" "}
        <a
          href={`mailto:${COMPANY.supportEmail}`}
          className="text-secondary hover:underline"
        >
          {COMPANY.supportEmail}
        </a>
        .
      </p>
    </LegalLayout>
  );
}
