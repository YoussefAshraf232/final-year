'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import { StockEditRequest, StockEditRequestStatus } from '@/types/stock-edit-request.types';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  request: StockEditRequest | null;
  isLoading?: boolean;
  canReview?: boolean;
  canCancel?: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onApprove: (comment?: string) => void;
  onReject: (comment?: string) => void;
  onAddComment: (comment: string) => void;
  onCancel: () => void;
}

const statusVariant: Record<StockEditRequestStatus, BadgeVariant> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'default',
};
const statusLabel: Record<StockEditRequestStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export default function StockEditRequestDrawer({
  isOpen,
  request,
  isLoading,
  canReview,
  canCancel,
  isSaving,
  onClose,
  onApprove,
  onReject,
  onAddComment,
  onCancel,
}: Props) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [confirmReject, setConfirmReject] = useState(false);

  if (!isOpen) return null;

  const isPending = request?.status === 'PENDING';
  const diff = request?.differenceQuantity ?? 0;
  const diffColor = diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : 'text-gray-500';
  const status = (request?.status ?? 'PENDING') as StockEditRequestStatus;

  const handleApprove = () => {
    onApprove(commentDraft.trim() || undefined);
  };
  const handleReject = () => {
    if (!confirmReject) {
      setConfirmReject(true);
      return;
    }
    onReject(commentDraft.trim() || undefined);
  };
  const handleAddComment = () => {
    if (!showCommentInput) {
      setShowCommentInput(true);
      return;
    }
    if (commentDraft.trim()) {
      onAddComment(commentDraft.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="ser-drawer-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 id="ser-drawer-title" className="text-lg font-semibold text-gray-900">Request Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm">
          {isLoading || !request ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <>
              <DetailRow label="Request ID" value={`RSE-${String(request.id).padStart(4, '0')}`} />
              <DetailRow label="Product" value={request.product?.name ?? '—'} />
              <DetailRow label="Warehouse" value={request.warehouse?.address ?? '—'} />

              <hr className="border-gray-100" />

              <DetailRow label="Current Qty" value={String(request.currentQuantity)} />
              <DetailRow label="Requested Qty" value={String(request.requestedQuantity)} />
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500">Difference</span>
                <span className={cn('font-semibold', diffColor)}>{diff > 0 ? `+${diff}` : diff}</span>
              </div>

              <DetailRow label="Reason" value={request.reason} />
              {request.notes && <DetailRow label="Notes" value={request.notes} multiline />}

              <hr className="border-gray-100" />

              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500">Status</span>
                <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
              </div>
              <DetailRow label="Requested By" value={request.requestedBy?.username ?? '—'} />
              <DetailRow label="Requested Date" value={formatDate(request.createdAt)} />
              <DetailRow label="Reviewed By" value={request.reviewedBy?.username ?? '—'} />
              <DetailRow label="Review Date" value={request.reviewedAt ? formatDate(request.reviewedAt) : '—'} />
              <DetailRow label="Manager Comment" value={request.reviewComment || '—'} multiline />

              {showCommentInput && (
                <div className="space-y-1.5">
                  <label htmlFor="comment-input" className="block text-xs font-medium text-gray-700">
                    {confirmReject ? 'Rejection comment (optional)' : 'Comment'}
                  </label>
                  <textarea
                    id="comment-input"
                    rows={3}
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Add a comment..."
                  />
                </div>
              )}

              {confirmReject && !showCommentInput && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Click Reject again to confirm rejection.
                </div>
              )}
            </>
          )}
        </div>

        {request && (
          <footer className="border-t border-gray-100 px-6 py-4 space-y-2">
            {canReview && isPending && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleReject} disabled={isSaving} className="border-red-300 text-red-600 hover:bg-red-50">
                  Reject
                </Button>
                <Button variant="primary" onClick={handleApprove} disabled={isSaving} isLoading={isSaving}>
                  Approve
                </Button>
              </div>
            )}
            <Button variant="outline" fullWidth onClick={handleAddComment} disabled={isSaving}>
              {showCommentInput ? 'Save Comment' : 'Add Comment'}
            </Button>
            {canCancel && isPending && (
              <Button variant="ghost" fullWidth onClick={onCancel} disabled={isSaving} className="text-red-600 hover:bg-red-50">
                Cancel Request
              </Button>
            )}
          </footer>
        )}
      </aside>
    </div>
  );
}

function DetailRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={cn('flex gap-3', multiline ? 'flex-col items-start' : 'items-start justify-between')}>
      <span className="text-gray-500">{label}</span>
      <span className={cn('text-gray-900', multiline ? 'text-sm whitespace-pre-wrap' : 'font-medium text-right')}>{value}</span>
    </div>
  );
}
