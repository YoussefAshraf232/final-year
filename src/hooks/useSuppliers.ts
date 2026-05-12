import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierService } from "@/services/supplier.service";
import {
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierFilterParams,
} from "@/types/supplier.types";

export function useSuppliers(
  params?: SupplierFilterParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => supplierService.getAll(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useSupplier(id: number) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => supplierService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useSupplierDetail(id: number | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["suppliers", "detail", id],
    queryFn: () => supplierService.getDetail(id as number).then((res) => res.data.data),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useSupplierStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["suppliers", "summary"],
    queryFn: () => supplierService.getStats().then((res) => res.data.data),
    enabled: options?.enabled ?? true,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["suppliers"] });
  qc.invalidateQueries({ queryKey: ["products"] });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierRequest) =>
      supplierService.create(data).then((res) => res.data),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierRequest }) =>
      supplierService.update(id, data).then((res) => res.data),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeactivateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      supplierService.deactivate(id).then((res) => res.data),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      supplierService.delete(id).then((res) => res.data),
    onSuccess: () => invalidateAll(queryClient),
  });
}
