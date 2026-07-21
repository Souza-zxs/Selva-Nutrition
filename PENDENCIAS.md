# O que falta para o Selva Nutrition vender sozinho

O backend técnico do ciclo do pedido está fechado (carrinho → checkout → pagamento →
envio → pós-venda, incluindo estorno com devolução de estoque e expiração de pedidos
pendentes). O que resta se divide em três naturezas bem diferentes.

## 1. Obrigatório por lei — sem isso a loja não pode operar no Brasil

- [x] **Política de Trocas e Devoluções + direito de arrependimento (7 dias).**
  Página em `/trocas-e-devolucoes` (`src/pages/legal/ReturnPolicy.tsx`), linkada
  no rodapé. Cobre arrependimento (7 dias, produto lacrado, frete de volta por
  nossa conta) e troca por defeito (30 dias, aceita aberto).
- [x] **Termos de Uso e Política de Privacidade.**
  Páginas em `/termos` e `/privacidade`, linkadas no rodapé. Privacidade já
  cobre LGPD (dados coletados, finalidade, compartilhamento com Mercado Pago/
  Resend/Supabase/transportadora, direitos do titular).
- [ ] **CNPJ, razão social e endereço visíveis no rodapé.**
  Código pronto (`src/data/company.ts` + rodapé + os três documentos acima já
  citam esses campos), mas os valores reais **ainda não foram preenchidos** —
  não inventei CNPJ/endereço. O rodapé e as páginas legais escondem essa linha
  automaticamente até `company.ts` ser preenchido, então nada de placeholder
  falso vai ao ar, mas a loja não está com a identificação legal completa
  ainda. Preencher em `src/data/company.ts`:
  - `legalName` (razão social ou nome completo se MEI/pessoa física)
  - `cnpj` (ou CPF, se pessoa física/MEI)
  - `address` (rua, número, bairro, cidade, UF, CEP — endereço que também vira
    o endereço de devolução na página de trocas)
  - `whatsapp` (opcional, hoje só o e-mail de suporte está preenchido)

## 2. Configuração operacional — código pronto, falta ligar a tomada

Conferido via `supabase secrets list` no projeto real (não só lendo código) —
hoje só `CRON_SECRET` está configurado. Nenhum dos outros existe, nem em
modo teste:

- [ ] **`MERCADOPAGO_ACCESS_TOKEN`.**
  Não configurado. Sem isso o `create-order` cria o pedido no banco mas
  retorna erro na hora de gerar o pagamento — ninguém consegue pagar.
- [ ] **`RESEND_API_KEY` + `RESEND_FROM_EMAIL`.**
  Não configurados. Sem isso, nenhum e-mail sai — nem "pedido recebido", nem
  "pagamento confirmado" (que funciona como comprovante da compra), nem
  "enviado", nem os lembretes de carrinho abandonado. A função apenas loga o
  erro e segue, então o checkout não quebra, mas o cliente não recebe nada.
  Depois de configurar, ainda falta verificar o domínio de envio no Resend —
  sem isso os e-mails saem de `onboarding@resend.dev`, o que derruba a taxa
  de entrega e parece spam.
- [ ] **`SITE_URL`.**
  Não configurado. Sem isso os links dentro dos e-mails (ex: "Acompanhar
  pedido") e os `back_urls` do Mercado Pago caem em `localhost:5173`.
- [ ] **Segredos do cron de carrinho abandonado / expiração de pedidos.**
  `cron_project_url` / `cron_secret` no Vault do Supabase ainda estão com o
  placeholder `CHANGE_ME` — sem popular, os crons rodam a cada hora mas falham
  silenciosamente.
- [ ] **Fotos e estoque reais dos 7 produtos.**
  Catálogo ainda tem placeholders/SVGs em alguns itens — conferir antes de
  divulgar a loja.

## 3. Fora do essencial — melhora a operação, não bloqueia vender

- **Emissão de nota fiscal (NF-e).**
  Não é bloqueante para vender via Mercado Pago, mas é obrigação fiscal
  separada — normalmente resolvida com um emissor terceirizado (Bling, Focus
  NFe) integrado depois.
- **Cupons de desconto.**
  Hoje só existe promoção fixa por produto (`sale_price`). Cupom por código é
  aditivo, não crítico.
- **Reserva de estoque durante o checkout.**
  Estoque só é validado (não reservado) na criação do pedido — em tese dois
  clientes podem "ganhar" a última unidade simultaneamente. Baixo risco no
  volume inicial da loja; vale revisitar se o catálogo tiver itens de estoque
  muito baixo.
- **Rastreio de transportadora integrado.**
  Hoje o código de rastreio é só texto livre no e-mail — sem link automático
  para Correios/transportadora.
