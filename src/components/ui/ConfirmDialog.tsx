'use client';

import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center mb-4',
            variant === 'danger' ? 'bg-red-50' : 'bg-indigo-50'
          )}
        >
          <AlertTriangle
            className={cn(
              'h-6 w-6',
              variant === 'danger' ? 'text-red-500' : 'text-indigo-500'
            )}
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex items-center gap-3 w-full">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} fullWidth onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}