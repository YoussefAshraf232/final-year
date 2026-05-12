import { PaginationParams } from "./api.types";

export type AuditEntityType =
  | "AUTH"
  | "USER"
  | "ROLE"
  | "PRODUCT"
  | "CUSTOMER"
  | "SUPPLIER"
  | "WAREHOUSE"
  | "SALES_INVOICE"
  | "PURCHASE_INVOICE"
  | "INTERNAL_INVOICE"
  | "RETURN_SALES_INVOICE"
  | "RETURN_PURCHASE_INVOICE"
  | "PAYMENT"
  | "STOCK_ADJUSTMENT"
  | "STOCK_EDIT_REQUEST"
  | "WAREHOUSE_STOCK_REQUEST"
  | "STOCK_MOVEMENT"
  | "STOCK_TRANSFER";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "DEACTIVATE"
  | "APPROVE"
  | "REJECT"
  | "LOGIN"
  | "REGISTER"
  | "VOID"
  | "TRANSFER"
  | "RECEIVE"
  | "RESTOCK"
  | "REFUND"
  | "STOCK_ADJUSTMENT";

export interface AuditLog {
  id: number;
  actorUserId: number | null;
  actorUsername: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  requestPath: string | null;
  httpMethod: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: string | null;
  createdAt: string;
}

export interface AuditLogFilterParams extends PaginationParams {
  actorUserId?: number;
  entityType?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
