import { COMPANY, formatCompanyAddress, isCompanyInfoComplete } from "../../data/company";
import LegalLayout from "../../components/legal/LegalLayout";

export default function PrivacyPolicy() {
  const address = formatCompanyAddress();
  const complete = isCompanyInfoComplete();

  return (
    <LegalLayout
      eyebrow="Legal"
      title="Política de Privacidade"
      updatedAt="20 de julho de 2026"
    >
      <p>
        Esta política explica como a Selva Nutrition{" "}
        {complete
          ? <>({COMPANY.legalName}, CNPJ {COMPANY.cnpj}, sede em {address})</>
          : <em>(identificação legal completa em preenchimento)</em>}
        {" "}coleta, usa e protege seus dados pessoais, em conformidade com a
        Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD).
      </p>

      <h2>Quais dados coletamos</h2>
      <p>
        Ao comprar ou se cadastrar, coletamos nome, e-mail, telefone e
        endereço de entrega. Não armazenamos dados de cartão de crédito — o
        pagamento é processado diretamente pelo Mercado Pago, que tem sua
        própria política de privacidade. Também guardamos, tecnicamente, o
        conteúdo do seu carrinho no navegador (localStorage), para que ele
        não se perca ao navegar pelo site.
      </p>

      <h2>Para que usamos esses dados</h2>
      <ul className="flex flex-col gap-2">
        <li>Processar e entregar seu pedido;</li>
        <li>Calcular frete e emitir a nota/comprovante da compra;</li>
        <li>
          Enviar e-mails transacionais sobre o pedido (confirmação, envio,
          rastreio, cancelamento);
        </li>
        <li>
          Lembrar você de um carrinho não finalizado, caso informe seu e-mail
          no checkout antes de concluir a compra;
        </li>
        <li>Atender solicitações de suporte, troca ou devolução.</li>
      </ul>
      <p>
        A base legal para esses usos é a execução do contrato de compra e
        venda. Não usamos seus dados para publicidade de terceiros nem os
        vendemos.
      </p>

      <h2>Com quem compartilhamos</h2>
      <p>
        Compartilhamos apenas o necessário para operar a loja: o Mercado Pago
        (processamento de pagamento), a transportadora responsável pela
        entrega, o Resend (envio de e-mails transacionais) e o Supabase
        (infraestrutura de banco de dados e hospedagem). Todos esses
        parceiros têm suas próprias políticas de proteção de dados.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <p>
        Dados de pedidos são mantidos pelo prazo exigido pela legislação
        fiscal e consumerista (garantia, arrependimento, eventual
        fiscalização). Dados de cadastro são mantidos enquanto sua conta
        estiver ativa, ou até você solicitar a exclusão.
      </p>

      <h2>Seus direitos como titular</h2>
      <p>
        Conforme a LGPD, você pode solicitar a qualquer momento: confirmação
        de que tratamos seus dados, acesso a eles, correção de dados
        incompletos ou desatualizados, exclusão de dados, portabilidade e
        revogação de consentimento (quando aplicável, como no caso da
        newsletter). Para exercer qualquer um desses direitos, escreva para{" "}
        <a
          href={`mailto:${COMPANY.supportEmail}`}
          className="text-secondary hover:underline"
        >
          {COMPANY.supportEmail}
        </a>
        .
      </p>

      <h2>Cookies e armazenamento local</h2>
      <p>
        Usamos apenas armazenamento local do navegador (localStorage) para
        manter seu carrinho de compras entre visitas — nenhum cookie de
        rastreamento de terceiros é usado neste site.
      </p>
    </LegalLayout>
  );
}
