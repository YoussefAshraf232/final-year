import { AuditEntityType } from "./audit.types";

export type NotificationType =
  | "LOW_STOCK"
  | "PURCHASE_ORDER_OVERDUE"
  | "UNPAID_INVOICE_OVERDUE"
  | "TRANSFER_PENDING_APPROVAL"
  | "RETURN_PENDING_APPROVAL";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: AuditEntityType;
  entityId?: number | string;
  readAt?: string | null;
  createdAt: string;
}
