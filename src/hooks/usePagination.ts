"use client";

import { useState, useCallback, useMemo } from "react";

interface UsePaginationProps {
  initialPage?: number;
  initialSize?: number;
}

interface UsePaginationReturn {
  page: number;
  size: number;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
  paginationParams: { page: number; size: number };
}

export function usePagination({
  initialPage = 0,
  initialSize = 10,
}: UsePaginationProps = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(0, prev - 1));
  }, []);

  const resetPage = useCallback(() => {
    setPage(0);
  }, []);

  // Reset to page 0 when size changes
  const handleSetSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  const paginationParams = useMemo(
    () => ({ page, size }),
    [page, size]
  );

  return {
    page,
    size,
    setPage,
    setSize: handleSetSize,
    nextPage,
    prevPage,
    resetPage,
    paginationParams,
  };
}