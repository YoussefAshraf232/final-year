import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseService } from "@/services/warehouse.service";
import {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  AssignUserToWarehouseRequest,
} from "@/types/warehouse.types";
import { PaginationParams } from "@/types/api.types";

export function useWarehouses(params?: PaginationParams) {
  return useQuery({
    queryKey: ["warehouses", params],
    queryFn: () => warehouseService.getAll(params).then((res) => res.data),
  });
}

export function useWarehouse(id: number) {
  return useQuery({
    queryKey: ["warehouses", id],
    queryFn: () => warehouseService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useWarehouseStock(warehouseId: number) {
  return useQuery({
    queryKey: ["warehouses", warehouseId, "stock"],
    queryFn: () =>
      warehouseService.getStock(warehouseId).then((res) => res.data.data),
    enabled: !!warehouseId,
  });
}

export function useWarehouseStaff(warehouseId: number) {
  return useQuery({
    queryKey: ["warehouses", warehouseId, "staff"],
    queryFn: () =>
      warehouseService.getStaff(warehouseId).then((res) => res.data.data),
    enabled: !!warehouseId,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWarehouseRequest) =>
      warehouseService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWarehouseRequest }) =>
      warehouseService.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      warehouseService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}

export function useAssignUserToWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignUserToWarehouseRequest) =>
      warehouseService.assignUser(data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["warehouses", variables.warehouseId, "staff"],
      });
    },
  });
}
