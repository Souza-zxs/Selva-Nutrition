// Envio de e-mail transacional via Resend (https://resend.com/docs/api-reference/emails/send-email).
// Falhas de e-mail nunca devem derrubar quem chama — cada envio é best-effort.

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function emailWrapper(innerHtml: string): string {
  return `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#3a3a32;">${innerHtml}</div>`;
}

type EmailItem = { name: string; qty: number; unitPrice: number };

function itemsTableHtml(
  items: EmailItem[],
  subtotal: number,
  shippingCost: number,
  shippingServiceName: string | null,
): string {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#3a3a32;">${item.qty}x ${escapeHtml(item.name)}</td>
          <td style="padding:8px 0;text-align:right;color:#3a3a32;">${formatBRL(item.qty * item.unitPrice)}</td>
        </tr>`,
    )
    .join("");
  const total = subtotal + shippingCost;

  return `
    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
      ${rows}
      <tr><td style="padding:12px 0 4px;border-top:1px solid #ddd;">Subtotal</td><td style="padding:12px 0 4px;border-top:1px solid #ddd;text-align:right;">${formatBRL(subtotal)}</td></tr>
      <tr><td style="padding:4px 0;">Frete${shippingServiceName ? ` (${escapeHtml(shippingServiceName)})` : ""}</td><td style="padding:4px 0;text-align:right;">${shippingCost === 0 ? "Grátis" : formatBRL(shippingCost)}</td></tr>
      <tr><td style="padding:12px 0 0;font-weight:bold;">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:bold;">${formatBRL(total)}</td></tr>
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
    body: JSON.stringify({ from, to, subject, html }),
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
  items: EmailItem[];
  subtotal: number;
  shippingCost: number;
  shippingServiceName: string | null;
  siteUrl: string;
};

export async function sendOrderReceivedEmail(input: OrderEmailInput) {
  const orderShortId = input.orderId.slice(0, 8);
  const html = emailWrapper(`
    <p style="text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#6b7a4f;">Pedido #${orderShortId}</p>
    <h1 style="font-size:22px;margin:8px 0 16px;">Recebemos seu pedido!</h1>
    <p>Olá, ${escapeHtml(input.customerName)}. Seu pedido foi registrado e está aguardando a confirmação do pagamento.</p>
    ${itemsTableHtml(input.items, input.subtotal, input.shippingCost, input.shippingServiceName)}
    <p><a href="${input.siteUrl}/pedido/${input.orderId}" style="color:#6b7a4f;">Acompanhar pedido</a></p>
  `);

  await sendResendEmail(
    input.to,
    `Recebemos seu pedido #${orderShortId} — Selva Nutrition`,
    html,
  );
}

// ---------------------------------------------------------------------------
// Pagamento aprovado — disparado pelo webhook do Mercado Pago na transição
// pending -> paid.
// ---------------------------------------------------------------------------
export async function sendOrderPaidEmail(input: OrderEmailInput) {
  const orderShortId = input.orderId.slice(0, 8);
  const html = emailWrapper(`
    <p style="text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#6b7a4f;">Pedido #${orderShortId}</p>
    <h1 style="font-size:22px;margin:8px 0 16px;">Pagamento confirmado!</h1>
    <p>Olá, ${escapeHtml(input.customerName)}. Recebemos seu pagamento e já estamos preparando seu pedido.</p>
    ${itemsTableHtml(input.items, input.subtotal, input.shippingCost, input.shippingServiceName)}
    <p><a href="${input.siteUrl}/pedido/${input.orderId}" style="color:#6b7a4f;">Acompanhar pedido</a></p>
  `);

  await sendResendEmail(
    input.to,
    `Pedido #${orderShortId} confirmado — Selva Nutrition`,
    html,
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
  trackingCode: string | null;
  siteUrl: string;
};

export async function sendOrderShippedEmail(input: OrderShippedEmailInput) {
  const orderShortId = input.orderId.slice(0, 8);
  const html = emailWrapper(`
    <p style="text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#6b7a4f;">Pedido #${orderShortId}</p>
    <h1 style="font-size:22px;margin:8px 0 16px;">Seu pedido foi enviado!</h1>
    <p>Olá, ${escapeHtml(input.customerName)}. Seu pedido já está a caminho.</p>
    ${
      input.trackingCode
        ? `<p style="margin:20px 0;padding:12px 16px;background:#f4f1e8;"><strong>Código de rastreio:</strong> ${escapeHtml(input.trackingCode)}</p>`
        : ""
    }
    <p><a href="${input.siteUrl}/pedido/${input.orderId}" style="color:#6b7a4f;">Acompanhar pedido</a></p>
  `);

  await sendResendEmail(
    input.to,
    `Pedido #${orderShortId} enviado — Selva Nutrition`,
    html,
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
  siteUrl: string;
};

export async function sendOrderCancelledEmail(input: OrderCancelledEmailInput) {
  const orderShortId = input.orderId.slice(0, 8);
  const html = emailWrapper(`
    <p style="text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#6b7a4f;">Pedido #${orderShortId}</p>
    <h1 style="font-size:22px;margin:8px 0 16px;">Seu pedido foi cancelado</h1>
    <p>Olá, ${escapeHtml(input.customerName)}. Seu pedido foi cancelado. Se você já havia pago, o estorno será processado pelo Mercado Pago conforme o meio de pagamento utilizado.</p>
    <p>Qualquer dúvida, responda este e-mail que te ajudamos.</p>
    <p><a href="${input.siteUrl}/pedido/${input.orderId}" style="color:#6b7a4f;">Ver pedido</a></p>
  `);

  await sendResendEmail(
    input.to,
    `Pedido #${orderShortId} cancelado — Selva Nutrition`,
    html,
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
        `<li style="padding:4px 0;">${item.qty}x ${escapeHtml(item.name)}</li>`,
    )
    .join("");

  const heading = input.isFinalReminder
    ? "Ainda pensando?"
    : "Você esqueceu algo no carrinho";
  const body = input.isFinalReminder
    ? "Seus itens continuam separados, mas o estoque é limitado — esse é nosso último lembrete."
    : "Seus itens continuam separados para você. É só voltar para finalizar a compra.";

  const html = emailWrapper(`
    <p style="text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#6b7a4f;">Selva Nutrition</p>
    <h1 style="font-size:22px;margin:8px 0 16px;">${heading}</h1>
    <p>Olá${greetingName ? `, ${greetingName}` : ""}. ${body}</p>
    <ul style="margin:24px 0;padding:0;list-style:none;">${itemsHtml}</ul>
    <p><a href="${input.siteUrl}/#colecao" style="display:inline-block;padding:12px 24px;background:#c9a227;color:#1a1a1a;text-decoration:none;font-weight:bold;">Voltar à loja</a></p>
  `);

  await sendResendEmail(
    input.to,
    input.isFinalReminder
      ? "Ainda pensando? Seu carrinho te espera — Selva Nutrition"
      : "Você esqueceu algo no carrinho — Selva Nutrition",
    html,
  );
}
