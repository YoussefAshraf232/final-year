'use client';

import { useMemo, useState } from 'react';
import { X, Printer, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import {
  PurchaseInvoice,
  ReceiptStatus,
  ReceiveMode,
  ReceiveOrderItemRequest,
  ReceiveOrderRequest,
} from '@/types/purchase-invoice.types';
import { formatDate } from '@/lib/formatters';
import { receiptStatusBadge, receiptStatusLabel } from '@/lib/receipt-status';

interface LineState {
  productId: number;
  ordered: number;
  received: number;
  damaged: number;
  notes: string;
}

interface ReceiveOrderDrawerProps {
  isOpen: boolean;
  mode: ReceiveMode | 'view';
  order: PurchaseInvoice | null;
  isSaving?: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSavePartial: (payload: ReceiveOrderRequest) => void;
  onConfirmReceipt: (payload: ReceiveOrderRequest) => void;
  onMarkDamaged: (payload: ReceiveOrderRequest) => void;
  onPrintGrn: () => void;
  onOpenReject: () => void;
}

export default function ReceiveOrderDrawer({
  isOpen,
  mode,
  order,
  isSaving = false,
  isLoading = false,
  onClose,
  onSavePartial,
  onConfirmReceipt,
  onMarkDamaged,
  onPrintGrn,
  onOpenReject,
}: ReceiveOrderDrawerProps) {
  const [lines, setLines] = useState<LineState[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [warnConfirm, setWarnConfirm] = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<number | null>(null);

  const readOnly = mode === 'view' || order?.receiptStatus === 'RECEIVED' || order?.receiptStatus === 'REJECTED';

  const currentOrderId = order?.id ?? null;
  if (currentOrderId !== trackedOrderId) {
    setTrackedOrderId(currentOrderId);
    if (order) {
      setLines(
        (order.items ?? []).map((it) => ({
          productId: it.productId ?? it.product?.id ?? 0,
          ordered: it.amount,
          received: it.receivedQuantity ?? 0,
          damaged: it.damagedQuantity ?? 0,
          notes: it.receivingNotes ?? '',
        }))
      );
      setGeneralNotes(order.receivingNotes ?? '');
    } else {
      setLines([]);
      setGeneralNotes('');
    }
    setErrors({});
    setWarnConfirm(false);
  }

  const totals = useMemo(() => {
    let ordered = 0, received = 0, damaged = 0, missing = 0;
    for (const l of lines) {
      ordered += l.ordered;
      received += l.received;
      damaged += l.damaged;
      missing += Math.max(0, l.ordered - l.received - l.damaged);
    }
    return { ordered, received, damaged, missing };
  }, [lines]);

  if (!isOpen) return null;

  const updateLine = (idx: number, patch: Partial<LineState>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const validate = (): boolean => {
    const next: Record<number, string> = {};
    let hasChange = false;
    if (!order) return false;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const orig = order.items?.[i];
      if (l.received < 0 || l.damaged < 0) {
        next[i] = 'Quantities cannot be negative';
        continue;
      }
      if (l.received + l.damaged > l.ordered) {
        next[i] = 'Received + damaged exceed ordered';
        continue;
      }
      const prevReceived = orig?.receivedQuantity ?? 0;
      if (l.received < prevReceived) {
        next[i] = 'Received cannot be reduced';
        continue;
      }
      const prevDamaged = orig?.damagedQuantity ?? 0;
      if (l.received !== prevReceived || l.damaged !== prevDamaged || (l.notes ?? '') !== (orig?.receivingNotes ?? '')) {
        hasChange = true;
      }
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return false;
    if (!hasChange) {
      setErrors({ [-1]: 'Enter at least one received or damaged quantity to save' } as unknown as Record<number, string>);
      return false;
    }
    return true;
  };

  const buildPayload = (m: ReceiveMode): ReceiveOrderRequest => ({
    mode: m,
    receivingDate: new Date().toISOString(),
    notes: generalNotes || undefined,
    items: lines.map<ReceiveOrderItemRequest>((l) => ({
      productId: l.productId,
      receivedQuantity: l.received,
      damagedQuantity: l.damaged,
      notes: l.notes || undefined,
    })),
  });

  const handleSavePartial = () => {
    if (!validate()) return;
    onSavePartial(buildPayload('PARTIAL'));
  };

  const handleConfirm = () => {
    if (!validate()) return;
    if (totals.received < totals.ordered && !warnConfirm) {
      setWarnConfirm(true);
      return;
    }
    onConfirmReceipt(buildPayload('CONFIRM'));
  };

  const handleMarkDamaged = () => {
    if (!validate()) return;
    onMarkDamaged(buildPayload('DAMAGED'));
  };

  const status: ReceiptStatus = (order?.receiptStatus ?? 'PENDING_RECEIPT') as ReceiptStatus;
  const statusBadge = receiptStatusBadge(status);
  const statusVariant: BadgeVariant = statusBadge.variant;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="receive-drawer-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 id="receive-drawer-title" className="text-lg font-semibold text-gray-900">Receive Order</h2>
            <p className="text-xs text-gray-500">{order ? `PO-${String(order.id).padStart(4, '0')}` : ''}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isLoading || !order ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <>
              <section className="grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="Order ID" value={`PO-${String(order.id).padStart(4, '0')}`} />
                <InfoRow label="Supplier" value={order.supplier?.name ?? '—'} />
                <InfoRow label="Warehouse" value={order.warehouse?.address ?? '—'} />
                <InfoRow label="Receiving Date" value={formatDate(order.receivedAt ?? order.createdAt)} />
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-gray-500">Status:</span>
                  <Badge variant={statusVariant}>{receiptStatusLabel(status)}</Badge>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-600" />
                  Line Items
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs uppercase text-gray-500">
                        <th className="px-3 py-2">Product</th>
                        <th className="px-3 py-2 w-20">Ordered</th>
                        <th className="px-3 py-2 w-24">Received</th>
                        <th className="px-3 py-2 w-24">Damaged</th>
                        <th className="px-3 py-2 w-20">Missing</th>
                        <th className="px-3 py-2 min-w-[140px]">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lines.map((l, idx) => {
                        const item = order.items?.[idx];
                        const missing = Math.max(0, l.ordered - l.received - l.damaged);
                        const lineError = errors[idx];
                        const focusDamaged = mode === 'DAMAGED';
                        return (
                          <tr key={`${l.productId}-${idx}`}>
                            <td className="px-3 py-2">
                              <div className="font-medium text-gray-900">{item?.product?.name ?? `#${l.productId}`}</div>
                              <div className="text-xs text-gray-400">SKU #{l.productId}</div>
                            </td>
                            <td className="px-3 py-2 text-gray-700">{l.ordered}</td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min={0}
                                max={l.ordered}
                                disabled={readOnly || isSaving}
                                value={l.received}
                                onChange={(e) => updateLine(idx, { received: Math.max(0, Number(e.target.value) || 0) })}
                                className={cn(
                                  'w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
                                  readOnly && 'bg-gray-50'
                                )}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min={0}
                                max={l.ordered}
                                disabled={readOnly || isSaving}
                                value={l.damaged}
                                autoFocus={focusDamaged && idx === 0}
                                onChange={(e) => updateLine(idx, { damaged: Math.max(0, Number(e.target.value) || 0) })}
                                className={cn(
                                  'w-20 rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2',
                                  focusDamaged ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500',
                                  readOnly && 'bg-gray-50'
                                )}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <span className={cn('text-sm', missing > 0 ? 'text-amber-600 font-medium' : 'text-gray-500')}>{missing}</span>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                disabled={readOnly || isSaving}
                                value={l.notes}
                                onChange={(e) => updateLine(idx, { notes: e.target.value })}
                                placeholder="Optional"
                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                              />
                              {lineError && (
                                <p className="mt-1 text-xs text-red-600">{lineError}</p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="grid grid-cols-4 gap-3 text-sm">
                <SummaryStat label="Ordered" value={totals.ordered} />
                <SummaryStat label="Received" value={totals.received} accent="emerald" />
                <SummaryStat label="Damaged" value={totals.damaged} accent="red" />
                <SummaryStat label="Missing" value={totals.missing} accent="amber" />
              </section>

              <section>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">General Notes</label>
                <textarea
                  rows={3}
                  disabled={readOnly || isSaving}
                  maxLength={300}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="e.g., Delivery condition, driver notes, package remarks..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-400 text-right">{generalNotes.length}/300</p>
              </section>

              {(errors as Record<number, string>)[-1] && (
                <p className="text-sm text-red-600">{(errors as Record<number, string>)[-1]}</p>
              )}

              {warnConfirm && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div>
                    Not all items were received. Save as partially received? Press Confirm Receipt again to proceed.
                  </div>
                </div>
              )}

              {!readOnly && (
                <section>
                  <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Available actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={handleSavePartial} disabled={isSaving}>Save Partial</Button>
                    <Button size="sm" variant="outline" onClick={handleMarkDamaged} disabled={isSaving}>Mark Damaged</Button>
                    <Button size="sm" variant="danger" onClick={onOpenReject} disabled={isSaving}>Reject Items</Button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <footer className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3">
          <Button variant="ghost" size="md" onClick={onPrintGrn} type="button" disabled={!order}>
            <Printer className="h-4 w-4" /> Print GRN
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={handleSavePartial} disabled={readOnly || isSaving} isLoading={isSaving && mode === 'PARTIAL'}>
              Save Partial
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirm} disabled={readOnly || isSaving} isLoading={isSaving && mode !== 'PARTIAL'}>
              Confirm Receipt
            </Button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: number; accent?: 'emerald' | 'red' | 'amber' }) {
  const accentClass: Record<string, string> = {
    emerald: 'text-emerald-700',
    red: 'text-red-700',
    amber: 'text-amber-700',
  };
  const cls = accent ? accentClass[accent] : 'text-gray-900';
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
      <p className="text-xs uppercase text-gray-400">{label}</p>
      <p className={cn('text-xl font-semibold mt-0.5', cls)}>{value}</p>
    </div>
  );
}
