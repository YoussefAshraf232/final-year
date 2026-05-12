import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import {
  ProductFilterParams,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product.types";

export function useProducts(
  params?: ProductFilterParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getAll(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useProductDetail(id: number | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: () => productService.getDetail(id as number).then((res) => res.data.data),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useProductStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["products", "summary"],
    queryFn: () => productService.getStats().then((res) => res.data.data),
    enabled: options?.enabled ?? true,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["products"] });
  qc.invalidateQueries({ queryKey: ["suppliers"] });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      productService.create(data).then((res) => res.data),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) =>
      productService.update(id, data).then((res) => res.data),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      productService.deactivate(id).then((res) => res.data),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      productService.delete(id).then((res) => res.data),
    onSuccess: () => invalidateAll(queryClient),
  });
}
