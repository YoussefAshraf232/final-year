'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface RejectOrderModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  orderLabel?: string;
  onClose: () => void;
  onConfirm: (reason: string, notes?: string) => void;
}

export default function RejectOrderModal({ isOpen, isSaving, orderLabel, onClose, onConfirm }: RejectOrderModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [wasOpen, setWasOpen] = useState(false);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setReason('');
      setNotes('');
      setError('');
    }
  }

  const handle = () => {
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }
    onConfirm(reason.trim(), notes.trim() || undefined);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Order" size="md">
      <div className="space-y-4">
        {orderLabel && (
          <p className="text-sm text-gray-600">
            You are about to reject <span className="font-semibold text-gray-900">{orderLabel}</span>. This will mark the order as rejected and prevent further receiving. Already received stock is not removed.
          </p>
        )}
        <Input
          id="reject-reason"
          label="Reason"
          placeholder="e.g., Wrong items delivered"
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(''); }}
          error={error}
        />
        <div>
          <label htmlFor="reject-notes" className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
          <textarea
            id="reject-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            placeholder="Additional details for audit log"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button variant="danger" onClick={handle} isLoading={isSaving}>Reject Order</Button>
        </div>
      </div>
    </Modal>
  );
}
