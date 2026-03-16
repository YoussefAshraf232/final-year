'use client';

import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
  isFirst,
  isLast,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <p className="text-sm text-gray-500">
        {totalElements !== undefined ? (
          <>Showing page <span className="font-medium text-gray-700">{page + 1}</span> of{' '}
          <span className="font-medium text-gray-700">{totalPages}</span>{' '}
          <span className="text-gray-400">({totalElements} total)</span></>
        ) : (
          <>Page <span className="font-medium text-gray-700">{page + 1}</span> of{' '}
          <span className="font-medium text-gray-700">{totalPages}</span></>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={isFirst || page === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={isLast || page >= totalPages - 1}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}