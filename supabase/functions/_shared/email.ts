// Envio de e-mail transacional via Resend (https://resend.com/docs/api-reference/emails/send-email).
// Falhas de e-mail nunca devem derrubar quem chama — cada envio é best-effort.
//
// Identidade visual replica a paleta do site (verde floresta + dourado
// manteiga) definida em src/index.css — ver BRAND abaixo.

const BRAND = {
  dark: "#0e1b12",
  paper: "#f4f1e8",
  card: "#fffdf8",
  gold: "#c9a227",
  text: "#1c2b21",
  muted: "#6b6a5c",
  sage: "#c8d6c2",
  sageDim: "#8ba088",
  border: "rgba(201,162,39,0.35)",
  divider: "#e5ddc8",
};

const LOGO_URL = "https://www.selvanutrition.com.br/logo-selva-touro.png";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Shell com a identidade da marca: faixa escura com o logo no topo e no
// rodapé (tagline + copyright), cartão claro no meio para o conteúdo
// transacional em si — o conteúdo precisa ler bem em qualquer cliente de
// e-mail, então não replicamos o fundo 100% escuro do site.
function emailShell(bodyHtml: string): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
</head>
<body style="margin:0;padding:0;background-color:${BRAND.paper};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.paper};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;border-collapse:collapse;background-color:${BRAND.card};border:1px solid ${BRAND.border};border-radius:6px;overflow:hidden;">
          <tr>
            <td style="background-color:${BRAND.dark};padding:26px 32px;text-align:center;">
              <img src="${LOGO_URL}" width="34" height="34" alt="Selva Nutrition" style="display:inline-block;vertical-align:middle;border:0;" />
              <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-family:Georgia,'Times New Roman',serif;font-size:19px;letter-spacing:5px;color:${BRAND.gold};text-transform:uppercase;">Selva</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;font-family:Georgia,'Times New Roman',serif;color:${BRAND.text};">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.dark};padding:22px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:12px;color:${BRAND.sage};">"Primitive Strength, Refined Performance."</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1px;color:${BRAND.sageDim};text-transform:uppercase;">© ${year} Selva Nutrition</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function eyebrow(label: string): string {
  return `<p style="margin:0 0 4px;text-transform:uppercase;letter-spacing:2px;font-size:12px;color:${BRAND.gold};font-family:Arial,Helvetica,sans-serif;font-weight:bold;">${escapeHtml(label)}</p>`;
}

function heading(text: string): string {
  return `<h1 style="font-size:22px;margin:6px 0 18px;color:${BRAND.text};">${escapeHtml(text)}</h1>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 4px;">
    <tr><td style="background-color:${BRAND.gold};border-radius:3px;">
      <a href="${href}" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;color:${BRAND.dark};text-decoration:none;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

// Comprador + data — mostrado em todo e-mail de pedido para servir de
// comprovante rápido, sem precisar abrir o link de acompanhamento.
function orderMetaHtml(customerName: string, orderId: string, createdAt: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.muted};border-bottom:1px solid ${BRAND.divider};padding-bottom:14px;">
      <tr>
        <td style="padding:2px 0;">Pedido</td>
        <td style="padding:2px 0;text-align:right;font-family:'Courier New',monospace;">#${escapeHtml(orderId.slice(0, 8))}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;">Comprador</td>
        <td style="padding:2px 0;text-align:right;">${escapeHtml(customerName)}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;">Data da compra</td>
        <td style="padding:2px 0;text-align:right;">${formatDateBR(createdAt)}</td>
      </tr>
    </table>`;
}

type EmailItem = { productId: string; name: string; qty: number; unitPrice: number };

function itemsTableHtml(
  items: EmailItem[],
  subtotal: number,
  shippingCost: number,
  shippingServiceName: string | null,
): string {
  const headerRow = `
    <tr>
      <td style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};border-bottom:1px solid ${BRAND.divider};">Produto</td>
      <td style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};border-bottom:1px solid ${BRAND.divider};text-align:right;">Valor</td>
    </tr>`;

  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;vertical-align:top;">
            <div style="color:${BRAND.text};">${item.qty}x ${escapeHtml(item.name)}</div>
            <div style="font-family:'Courier New',monospace;font-size:11px;color:${BRAND.sageDim};margin-top:2px;">ID: ${escapeHtml(item.productId.slice(0, 8))}</div>
          </td>
          <td style="padding:10px 0;text-align:right;vertical-align:top;color:${BRAND.text};">${formatBRL(item.qty * item.unitPrice)}</td>
        </tr>`,
    )
    .join("");
  const total = subtotal + shippingCost;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:14px;">
      ${headerRow}
      ${rows}
      <tr><td style="padding:14px 0 4px;border-top:1px solid ${BRAND.divider};color:${BRAND.text};">Subtotal</td><td style="padding:14px 0 4px;border-top:1px solid ${BRAND.divider};text-align:right;color:${BRAND.text};">${formatBRL(subtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:${BRAND.text};">Frete${shippingServiceName ? ` (${escapeHtml(shippingServiceName)})` : ""}</td><td style="padding:4px 0;text-align:right;color:${BRAND.text};">${shippingCost === 0 ? "Grátis" : formatBRL(shippingCost)}</td></tr>
      <tr><td style="padding:12px 0 0;font-weight:bold;color:${BRAND.text};">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:bold;color:${BRAND.text};">${formatBRL(total)}</td></tr>
    </table>`;
}

async function sendResendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurado — pulando envio de e-mail");
    return;
  }

  const from =
    Deno.env.get("RESEND_FROM_EMAIL") ?? "Selva Nutrition <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      reply_to: "contato@selvanutrition.com",
    }),
  });

  if (!res.ok) {
    console.error(`Falha ao enviar e-mail ("${subject}"):`, await res.text());
  }
}

// ---------------------------------------------------------------------------
// Pedido recebido — disparado assim que o pedido é criado (create-order),
// antes de qualquer confirmação de pagamento.
// ---------------------------------------------------------------------------
export type OrderEmailInput = {
  to: string;
  customerName: string;
  orderId: string;
  createdAt: string;
  items: EmailItem[];
  subtotal: number;
  shippingCost: number;
  shippingServiceName: string | null;
  siteUrl: string;
};

export async function sendOrderReceivedEmail(input: OrderEmailInput) {
  const orderShortId = input.orderId.slice(0, 8);
  const body = `
    ${eyebrow("Pedido confirmado")}
    ${heading("Recebemos seu pedido!")}
    <p style="margin:0 0 20px;line-height:1.6;">Olá, ${escapeHtml(input.customerName)}. Seu pedido foi registrado e está aguardando a confirmação do pagamento.</p>
    ${orderMetaHtml(input.customerName, input.orderId, input.createdAt)}
    ${itemsTableHtml(input.items, input.subtotal, input.shippingCost, input.shippingServiceName)}
    ${ctaButton(`${input.siteUrl}/pedido/${input.orderId}`, "Acompanhar pedido")}
  `;

  await sendResendEmail(
    input.to,
    `Recebemos seu pedido #${orderShortId} — Selva Nutrition`,
    emailShell(body),
  );
}

// ---------------------------------------------------------------------------
// Pagamento aprovado — disparado pelo webhook do Mercado Pago na transição
// pending -> paid.
// ---------------------------------------------------------------------------
export async function sendOrderPaidEmail(input: OrderEmailInput) {
  const orderShortId = input.orderId.slice(0, 8);
  const body = `
    ${eyebrow("Pagamento aprovado")}
    ${heading("Pagamento confirmado!")}
    <p style="margin:0 0 20px;line-height:1.6;">Olá, ${escapeHtml(input.customerName)}. Recebemos seu pagamento e já estamos preparando seu pedido.</p>
    ${orderMetaHtml(input.customerName, input.orderId, input.createdAt)}
    ${itemsTableHtml(input.items, input.subtotal, input.shippingCost, input.shippingServiceName)}
    ${ctaButton(`${input.siteUrl}/pedido/${input.orderId}`, "Acompanhar pedido")}
  `;

  await sendResendEmail(
    input.to,
    `Pedido #${orderShortId} confirmado — Selva Nutrition`,
    emailShell(body),
  );
}

// ---------------------------------------------------------------------------
// Pedido enviado — disparado pelo admin-update-order quando o admin muda o
// status para "shipped", opcionalmente com código de rastreio.
// ---------------------------------------------------------------------------
export type OrderShippedEmailInput = {
  to: string;
  customerName: string;
  orderId: string;
  createdAt: string;
  trackingCode: string | null;
  siteUrl: string;
};

export async function sendOrderShippedEmail(input: OrderShippedEmailInput) {
  const orderShortId = input.orderId.slice(0, 8);
  const body = `
    ${eyebrow("A caminho")}
    ${heading("Seu pedido foi enviado!")}
    <p style="margin:0 0 20px;line-height:1.6;">Olá, ${escapeHtml(input.customerName)}. Seu pedido já está a caminho.</p>
    ${orderMetaHtml(input.customerName, input.orderId, input.createdAt)}
    ${
      input.trackingCode
        ? `<p style="margin:0 0 20px;padding:12px 16px;background:${BRAND.paper};border-left:3px solid ${BRAND.gold};"><strong>Código de rastreio:</strong> ${escapeHtml(input.trackingCode)}</p>`
        : ""
    }
    ${ctaButton(`${input.siteUrl}/pedido/${input.orderId}`, "Acompanhar pedido")}
  `;

  await sendResendEmail(
    input.to,
    `Pedido #${orderShortId} enviado — Selva Nutrition`,
    emailShell(body),
  );
}

// ---------------------------------------------------------------------------
// Pedido cancelado/recusado — disparado pelo admin-update-order quando um
// pedido que já estava pago é cancelado ou marcado como recusado depois do
// fato (estorno, problema logístico etc.).
// ---------------------------------------------------------------------------
export type OrderCancelledEmailInput = {
  to: string;
  customerName: string;
  orderId: string;
  createdAt: string;
  siteUrl: string;
};

export async function sendOrderCancelledEmail(input: OrderCancelledEmailInput) {
  const orderShortId = input.orderId.slice(0, 8);
  const body = `
    ${eyebrow("Pedido cancelado")}
    ${heading("Seu pedido foi cancelado")}
    <p style="margin:0 0 20px;line-height:1.6;">Olá, ${escapeHtml(input.customerName)}. Seu pedido foi cancelado. Se você já havia pago, o estorno será processado pelo Mercado Pago conforme o meio de pagamento utilizado.</p>
    ${orderMetaHtml(input.customerName, input.orderId, input.createdAt)}
    <p style="margin:0 0 20px;line-height:1.6;">Qualquer dúvida, responda este e-mail que te ajudamos.</p>
    ${ctaButton(`${input.siteUrl}/pedido/${input.orderId}`, "Ver pedido")}
  `;

  await sendResendEmail(
    input.to,
    `Pedido #${orderShortId} cancelado — Selva Nutrition`,
    emailShell(body),
  );
}

// ---------------------------------------------------------------------------
// Recuperação de carrinho — disparado pelo cron (send-cart-recovery-emails)
// quando um carrinho fica parado sem virar pedido. Dois estágios: um lembrete
// rápido e um último aviso bem mais tarde.
// ---------------------------------------------------------------------------
export type CartRecoveryInput = {
  to: string;
  customerName: string | null;
  items: { name: string; qty: number }[];
  siteUrl: string;
  isFinalReminder: boolean;
};

export async function sendCartRecoveryEmail(input: CartRecoveryInput) {
  const greetingName = input.customerName ? escapeHtml(input.customerName) : "";
  const itemsHtml = input.items
    .map(
      (item) =>
        `<li style="padding:4px 0;color:${BRAND.text};">${item.qty}x ${escapeHtml(item.name)}</li>`,
    )
    .join("");

  const headingText = input.isFinalReminder
    ? "Ainda pensando?"
    : "Você esqueceu algo no carrinho";
  const bodyText = input.isFinalReminder
    ? "Seus itens continuam separados, mas o estoque é limitado — esse é nosso último lembrete."
    : "Seus itens continuam separados para você. É só voltar para finalizar a compra.";

  const body = `
    ${eyebrow("Selva Nutrition")}
    ${heading(headingText)}
    <p style="margin:0 0 20px;line-height:1.6;">Olá${greetingName ? `, ${greetingName}` : ""}. ${bodyText}</p>
    <ul style="margin:0 0 8px;padding:0;list-style:none;font-family:Georgia,'Times New Roman',serif;font-size:14px;">${itemsHtml}</ul>
    ${ctaButton(`${input.siteUrl}/#colecao`, "Voltar à loja")}
  `;

  await sendResendEmail(
    input.to,
    input.isFinalReminder
      ? "Ainda pensando? Seu carrinho te espera — Selva Nutrition"
      : "Você esqueceu algo no carrinho — Selva Nutrition",
    emailShell(body),
  );
}
