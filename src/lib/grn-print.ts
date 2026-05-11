import type { PurchaseInvoice } from '@/types/purchase-invoice.types';
import { receiptStatusLabel } from './receipt-status';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function printGrn(order: PurchaseInvoice, receivedByName?: string) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  const items = order.items ?? [];
  const dateLabel = order.receivedAt
    ? new Date(order.receivedAt).toLocaleString()
    : new Date(order.createdAt).toLocaleString();

  const rows = items.map((it) => {
    const ordered = it.amount;
    const received = it.receivedQuantity ?? 0;
    const damaged = it.damagedQuantity ?? 0;
    const missing = Math.max(0, ordered - received - damaged);
    const name = escapeHtml(it.product?.name ?? `#${it.productId ?? ''}`);
    const notes = escapeHtml(it.receivingNotes ?? '');
    return `<tr>
      <td>${name}</td>
      <td style="text-align:right">${ordered}</td>
      <td style="text-align:right">${received}</td>
      <td style="text-align:right">${damaged}</td>
      <td style="text-align:right">${missing}</td>
      <td>${notes}</td>
    </tr>`;
  }).join('');

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>GRN PO-${order.id}</title>
<style>
  body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; padding: 32px; color: #111827; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .muted { color: #6b7280; font-size: 12px; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 24px; margin: 16px 0 24px; font-size: 14px; }
  .grid div span { display:block; color: #6b7280; font-size: 11px; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
  th { background: #f9fafb; font-size: 11px; text-transform: uppercase; color: #6b7280; }
  .notes { margin-top: 24px; font-size: 13px; }
  .footer { margin-top: 32px; font-size: 12px; color: #6b7280; }
</style></head>
<body>
  <h1>Goods Received Note</h1>
  <div class="muted">Order PO-${String(order.id).padStart(4, '0')}</div>
  <div class="grid">
    <div><span>Supplier</span>${escapeHtml(order.supplier?.name ?? '—')}</div>
    <div><span>Warehouse</span>${escapeHtml(order.warehouse?.address ?? '—')}</div>
    <div><span>Received Date</span>${escapeHtml(dateLabel)}</div>
    <div><span>Status</span>${escapeHtml(receiptStatusLabel(order.receiptStatus))}</div>
    <div><span>Received By</span>${escapeHtml(receivedByName ?? order.receivedByUser?.username ?? '—')}</div>
  </div>
  <table>
    <thead><tr><th>Product</th><th>Ordered</th><th>Received</th><th>Damaged</th><th>Missing</th><th>Notes</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#9ca3af">No items</td></tr>'}</tbody>
  </table>
  <div class="notes"><strong>General Notes:</strong> ${escapeHtml(order.receivingNotes ?? '—')}</div>
  <div class="footer">Generated ${escapeHtml(new Date().toLocaleString())}</div>
  <script>window.onload = () => { setTimeout(() => { window.print(); }, 200); };</script>
</body></html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}
