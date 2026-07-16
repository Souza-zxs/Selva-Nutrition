// Envio de e-mail transacional via Resend (https://resend.com/docs/api-reference/emails/send-email).
// Falhas de e-mail nunca devem derrubar o webhook — quem chama trata o erro e segue em frente.

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export type OrderConfirmationInput = {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; qty: number; unitPrice: number }[];
  subtotal: number;
  shippingCost: number;
  shippingServiceName: string | null;
  siteUrl: string;
};

export async function sendOrderConfirmationEmail(input: OrderConfirmationInput) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurado — pulando envio de e-mail");
    return;
  }

  const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "Selva Nutrition <onboarding@resend.dev>";
  const total = input.subtotal + input.shippingCost;
  const orderShortId = input.orderId.slice(0, 8);

  const itemsHtml = input.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#3a3a32;">${item.qty}x ${escapeHtml(item.name)}</td>
          <td style="padding:8px 0;text-align:right;color:#3a3a32;">${formatBRL(item.qty * item.unitPrice)}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#3a3a32;">
      <p style="text-transform:uppercase;letter-spacing:2px;font-size:12px;color:#6b7a4f;">Pedido #${orderShortId}</p>
      <h1 style="font-size:22px;margin:8px 0 16px;">Pagamento confirmado!</h1>
      <p>Olá, ${escapeHtml(input.customerName)}. Recebemos seu pagamento e já estamos preparando seu pedido.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        ${itemsHtml}
        <tr><td style="padding:12px 0 4px;border-top:1px solid #ddd;">Subtotal</td><td style="padding:12px 0 4px;border-top:1px solid #ddd;text-align:right;">${formatBRL(input.subtotal)}</td></tr>
        <tr><td style="padding:4px 0;">Frete${input.shippingServiceName ? ` (${escapeHtml(input.shippingServiceName)})` : ""}</td><td style="padding:4px 0;text-align:right;">${input.shippingCost === 0 ? "Grátis" : formatBRL(input.shippingCost)}</td></tr>
        <tr><td style="padding:12px 0 0;font-weight:bold;">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:bold;">${formatBRL(total)}</td></tr>
      </table>
      <p><a href="${input.siteUrl}/pedido/${input.orderId}" style="color:#6b7a4f;">Acompanhar pedido</a></p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: `Pedido #${orderShortId} confirmado — Selva Nutrition`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Falha ao enviar e-mail de confirmação:", await res.text());
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
