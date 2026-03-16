import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { CreateCategoryRequest, UpdateCategoryRequest } from "@/types/category.types";
import { PaginationParams } from "@/types/api.types";

export function useCategories(params?: PaginationParams) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoryService.getAll(params).then((res) => res.data),
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => categoryService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      categoryService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
      categoryService.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      categoryService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
