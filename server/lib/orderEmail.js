/**
 * Admin order-notification email.
 * Built around Resend; gracefully degrades to a no-op if RESEND_API_KEY or
 * ADMIN_EMAIL are not configured (logs a warning instead of throwing).
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const escapeHtml = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function buildItemsHtml(items) {
  if (!items || items.length === 0) return '';
  return items
    .map((it) => {
      const label =
        escapeHtml(it.product_name) +
        (it.variant_label ? ` — ${escapeHtml(it.variant_label)}` : '');
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${label}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${Number(it.quantity)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${fmt(it.line_total)}</td>
        </tr>`;
    })
    .join('');
}

function buildHtml({ order, items, adminUrl }) {
  const itemsHtml = buildItemsHtml(items);
  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"><title>New Order ${escapeHtml(order.order_number)}</title></head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">New Order — ${escapeHtml(order.order_number)}</h1>
      <p style="color: #e6e6ff; margin: 6px 0 0;">${escapeHtml(order.checkout_type || 'product')} · ${escapeHtml(order.payment_method || '')}</p>
    </div>
    <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px;">
      <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
        <h2 style="color: #667eea; margin-top: 0;">Customer</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 130px;">Name:</td><td>${escapeHtml(order.customer_name)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td>${escapeHtml(order.customer_email)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Phone:</td><td>${escapeHtml(order.customer_phone)}</td></tr>
          ${order.shipping_address ? `<tr><td style="padding: 6px 0; font-weight: bold;">Address:</td><td>${escapeHtml(order.shipping_address)}</td></tr>` : ''}
        </table>
      </div>

      ${itemsHtml ? `
      <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
        <h2 style="color: #667eea; margin-top: 0;">Items</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Line Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </div>` : ''}

      <div style="background: white; padding: 20px; border-radius: 8px;">
        <h2 style="color: #667eea; margin-top: 0;">Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0;">Subtotal:</td><td style="text-align: right;">${fmt(order.subtotal)}</td></tr>
          ${Number(order.coupon_discount) > 0 ? `<tr><td style="padding: 6px 0;">Discount${order.coupon_code ? ` (${escapeHtml(order.coupon_code)})` : ''}:</td><td style="text-align: right; color: #c0392b;">−${fmt(order.coupon_discount)}</td></tr>` : ''}
          ${Number(order.shipping_cost) > 0 ? `<tr><td style="padding: 6px 0;">Delivery:</td><td style="text-align: right;">${fmt(order.shipping_cost)}</td></tr>` : ''}
          <tr style="border-top: 2px solid #667eea;">
            <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #667eea;">Total:</td>
            <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #667eea;">${fmt(order.total)}</td>
          </tr>
        </table>
      </div>

      ${adminUrl ? `<p style="text-align: center; margin-top: 20px;"><a href="${escapeHtml(adminUrl)}" style="background: #667eea; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">View in Admin →</a></p>` : ''}
    </div>
    <p style="text-align: center; color: #666; font-size: 12px;">Automated notification from KHA Mobile · ${new Date().toLocaleString()}</p>
  </body></html>`;
}

/**
 * Send the admin notification email.
 * @param {{ order: object, items: object[] }} args
 * @returns {Promise<{ sent: boolean, reason?: string, id?: string }>}
 */
export async function sendOrderEmail({ order, items }) {
  if (!resend || !process.env.ADMIN_EMAIL) {
    console.warn('[orderEmail] skipped — RESEND_API_KEY / ADMIN_EMAIL not configured');
    return { sent: false, reason: 'not_configured' };
  }

  const siteUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
  const adminUrl = siteUrl ? `${siteUrl}/admin/orders` : null;

  const html = buildHtml({ order, items, adminUrl });
  const subject = `Order ${order.order_number} — ${order.customer_name || 'New customer'} · ${fmt(order.total)}`;

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM || 'onboarding@resend.dev',
      to: [process.env.ADMIN_EMAIL],
      subject,
      html,
    });
    return { sent: true, id: data?.id };
  } catch (err) {
    console.error('[orderEmail] send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}
