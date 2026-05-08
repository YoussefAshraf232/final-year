import { PaginationParams } from "./api.types";

export type AuditEntityType =
  | "AUTH"
  | "PRODUCT"
  | "CUSTOMER"
  | "SUPPLIER"
  | "WAREHOUSE"
  | "SALES_INVOICE"
  | "PURCHASE_INVOICE"
  | "PAYMENT"
  | "STOCK_ADJUSTMENT"
  | "STOCK_TRANSFER"
  | "USER"
  | "ROLE";

export interface AuditLog {
  id: number;
  actorUserId: number;
  actorUsername: string;
  action: string;
  entityType: AuditEntityType;
  entityId: number | string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilterParams extends PaginationParams {
  actorUserId?: number;
  entityType?: AuditEntityType;
  entityId?: number | string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}
