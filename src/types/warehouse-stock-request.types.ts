import { Product } from "./product.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";

export type WarehouseStockRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export interface WarehouseStockRequest {
  id: number;
  product?: Product;
  sourceWarehouse?: Warehouse;
  destinationWarehouse?: Warehouse;
  requestedQuantity: number;
  approvedQuantity?: number | null;
  availableQuantity: number;
  status: WarehouseStockRequestStatus;
  reason: string;
  notes?: string | null;
  requestedBy?: User | null;
  reviewedBy?: User | null;
  reviewerComment?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
}

export interface CreateWarehouseStockRequestPayload {
  productId: number;
  sourceWarehouseId: number;
  destinationWarehouseId?: number;
  requestedQuantity: number;
  reason: string;
  notes?: string;
}

export interface ReviewWarehouseStockRequestPayload {
  approvedQuantity?: number;
  comment?: string;
}

export interface WarehouseStockRequestFilters {
  page?: number;
  size?: number;
  status?: WarehouseStockRequestStatus | "";
}

export interface WarehouseStockRequestSummary {
  outgoingPendingCount: number;
  incomingPendingCount: number;
  acceptedTodayCount: number;
  rejectedCount: number;
}
