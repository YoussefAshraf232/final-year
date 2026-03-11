import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierService } from "@/services/supplier.service";
import { CreateSupplierRequest, UpdateSupplierRequest } from "@/types/supplier.types";
import { PaginationParams } from "@/types/api.types";

export function useSuppliers(params?: PaginationParams) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => supplierService.getAll(params).then((res) => res.data),
  });
}

export function useSupplier(id: number) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => supplierService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierRequest) =>
      supplierService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierRequest }) =>
      supplierService.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      supplierService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
