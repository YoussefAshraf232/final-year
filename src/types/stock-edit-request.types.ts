import { Product } from "./product.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";

export type StockEditRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface StockEditRequest {
  id: number;
  product?: Product;
  warehouse?: Warehouse;
  currentQuantity: number;
  requestedQuantity: number;
  differenceQuantity: number;
  reason: string;
  notes?: string | null;
  status: StockEditRequestStatus;
  requestedBy?: User | null;
  reviewedBy?: User | null;
  reviewComment?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  cancelledAt?: string | null;
}

export interface CreateStockEditRequestPayload {
  productId: number;
  warehouseId: number;
  requestedQuantity: number;
  reason: string;
  notes?: string;
}

export interface ReviewStockEditRequestPayload {
  comment?: string;
}

export interface StockEditRequestSummary {
  pendingRequestsCount: number;
  approvedTodayCount: number;
  rejectedRequestsCount: number;
  totalAdjustmentsThisMonth: number;
}

export interface StockEditRequestFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: StockEditRequestStatus | "";
  productId?: number | "";
  warehouseId?: number | "";
  dateFrom?: string;
  dateTo?: string;
}

export const STOCK_EDIT_REASON_OPTIONS: string[] = [
  "Damaged items",
  "Physical count correction",
  "Expired stock",
  "Missing items",
  "Wrong warehouse count",
  "Manual recount",
  "Other",
];

export const STOCK_EDIT_STATUS_OPTIONS: { value: StockEditRequestStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];
