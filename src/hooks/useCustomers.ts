import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import {
  CreateCustomerRequest,
  CustomerFilterParams,
  UpdateCustomerRequest,
} from "@/types/customer.types";

export function useCustomers(
  params?: CustomerFilterParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["customers", "list", params],
    queryFn: () => customerService.getAll(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useCustomer(id?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["customers", "detail", id],
    queryFn: () => customerService.getById(id as number).then((res) => res.data.data),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCustomerSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["customers", "summary"],
    queryFn: () => customerService.getSummary().then((res) => res.data.data),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) =>
      customerService.create(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCustomerRequest }) =>
      customerService.update(id, data).then((res) => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", "detail", variables.id] });
    },
  });
}

export function useDeactivateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      customerService.deactivate(id).then((res) => res.data.data),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", "detail", id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      customerService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
