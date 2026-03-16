import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { ProductFilterParams } from "@/types/product.types";
import { CreateProductRequest, UpdateProductRequest } from "@/types/product.types";

// GET all products
export function useProducts(params?: ProductFilterParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getAll(params).then((res) => res.data),
  });
}

// GET single product
export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

// CREATE product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      productService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// UPDATE product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) =>
      productService.update(id, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
    },
  });
}

// DELETE product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      productService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
