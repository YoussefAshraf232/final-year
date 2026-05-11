'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouses';
import { stockService } from '@/services/stock.service';
import {
  CreateStockEditRequestPayload,
  STOCK_EDIT_REASON_OPTIONS,
} from '@/types/stock-edit-request.types';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStockEditRequestPayload) => void;
}

export default function CreateStockEditRequestModal({ isOpen, isSaving, onClose, onSubmit }: Props) {
  const [productId, setProductId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [adjustment, setAdjustment] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const productsQuery = useProducts({ size: 200 }, { enabled: isOpen });
  const warehousesQuery = useWarehouses({ size: 200 }, { enabled: isOpen });
  const stockQuery = useQuery({
    queryKey: ['stock', 'warehouse', warehouseId],
    queryFn: () => stockService.getWarehouseStock(warehouseId as number).then((res) => res.data),
    enabled: isOpen && warehouseId !== '',
  });

  const productOptions = useMemo(() => ([
    { value: '', label: 'Select product...' },
    ...((productsQuery.data?.content ?? []).map((p) => ({ value: String(p.id), label: p.name }))),
  ]), [productsQuery.data]);

  const warehouseOptions = useMemo(() => ([
    { value: '', label: 'Select warehouse...' },
    ...((warehousesQuery.data?.content ?? []).map((w) => ({ value: String(w.id), label: w.address }))),
  ]), [warehousesQuery.data]);

  const reasonOptions = useMemo(() => ([
    { value: '', label: 'Select reason...' },
    ...STOCK_EDIT_REASON_OPTIONS.map((r) => ({ value: r, label: r })),
  ]), []);

  const currentQty = useMemo(() => {
    if (productId === '' || warehouseId === '') return null;
    const rows = stockQuery.data?.content ?? [];
    const match = rows.find((r) => r.productId === productId);
    return match ? match.quantityOnHand ?? (match as { amount?: number }).amount ?? 0 : 0;
  }, [productId, warehouseId, stockQuery.data]);

  const adjustmentNum = adjustment === '' ? null : Number(adjustment);
  const newQty = currentQty !== null && adjustmentNum !== null ? currentQty + adjustmentNum : null;
  const diff = adjustmentNum;

  const handleSubmit = () => {
    const next: Record<string, string> = {};
    if (productId === '') next.productId = 'Required';
    if (warehouseId === '') next.warehouseId = 'Required';
    if (adjustment === '' || adjustmentNum === null || isNaN(adjustmentNum)) next.adjustment = 'Required';
    else if (adjustmentNum === 0) next.adjustment = 'Adjustment cannot be zero';
    else if (newQty !== null && newQty < 0) next.adjustment = `Cannot reduce below 0 (current: ${currentQty})`;
    if (!reason) next.reason = 'Required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      productId: productId as number,
      warehouseId: warehouseId as number,
      requestedQuantity: newQty as number,
      reason,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Stock Edit Request" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="ser-product"
            label="Product"
            value={productId === '' ? '' : String(productId)}
            onChange={(e) => setProductId(e.target.value === '' ? '' : Number(e.target.value))}
            options={productOptions}
            error={errors.productId}
          />
          <Select
            id="ser-warehouse"
            label="Warehouse"
            value={warehouseId === '' ? '' : String(warehouseId)}
            onChange={(e) => setWarehouseId(e.target.value === '' ? '' : Number(e.target.value))}
            options={warehouseOptions}
            error={errors.warehouseId}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Qty</label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
              {currentQty === null ? '—' : currentQty}
            </div>
          </div>
          <Input
            id="ser-adjustment"
            label="Adjustment"
            type="number"
            placeholder="e.g. +5 or -3"
            value={adjustment}
            onChange={(e) => setAdjustment(e.target.value)}
            error={errors.adjustment}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Qty</label>
            <div className={cn(
              'rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold',
              newQty === null ? 'text-gray-500' : newQty < 0 ? 'text-red-600' : 'text-gray-900'
            )}>
              {newQty === null ? '—' : newQty}
              {diff !== null && diff !== 0 && (
                <span className={cn('ml-2 text-xs', diff > 0 ? 'text-emerald-600' : 'text-red-600')}>
                  ({diff > 0 ? `+${diff}` : diff})
                </span>
              )}
            </div>
          </div>
        </div>
        <Select
          id="ser-reason"
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={reasonOptions}
          error={errors.reason}
        />
        <div>
          <label htmlFor="ser-notes" className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
          <textarea
            id="ser-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explanation, evidence, links..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSaving}>Submit Request</Button>
        </div>
      </div>
    </Modal>
  );
}
