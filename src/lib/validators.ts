import { z } from "zod";

// 222222222222222222
// Auth
// 22222222222222222
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"], {
    required_error: "Role is required",
  }),
});

// 222222222222222222
// Category
// 222222222222222222
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name is too long"),
});

// 222222222222222222
// Product
// 222222222222222222
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  photo: z
    .string()
    .optional(),
  currentPrice: z
    .number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0"),
  categoryId: z
    .number({ required_error: "Category is required", invalid_type_error: "Select a category" })
    .int()
    .positive("Select a category"),
  supplierId: z
    .number({ required_error: "Supplier is required", invalid_type_error: "Select a supplier" })
    .int()
    .positive("Select a supplier"),
});

// 222222222222222222
// Customer
// 222222222222222222
export const customerSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name is required")
    .max(200, "Name is too long"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address is too long"),
});

// 222222222222222222
// Supplier
// 222222222222222222
export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, "Supplier name is required")
    .max(200, "Name is too long"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address is too long"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number is too long"),
});

// 222222222222222222
// Warehouse
// 222222222222222222
export const warehouseSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address is too long"),
  isCentral: z
    .boolean(),
});

// 222222222222222222
// User
// 222222222222222222
export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"], {
    required_error: "Role is required",
  }),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .optional(),
  role: z
    .enum(["ADMIN", "MANAGER", "EMPLOYEE"])
    .optional(),
});

// 222222222222222222
// Invoice Items (shared shape)
// 222222222222222222
const invoiceItemSchema = z.object({
  productId: z
    .number({ required_error: "Product is required" })
    .int()
    .positive("Select a product"),
  amount: z
    .number({ required_error: "Amount is required" })
    .int()
    .positive("Amount must be at least 1"),
});

// ——————————————————————————————
// Sales Invoice
// ——————————————————————————————
export const salesInvoiceSchema = z.object({
  customerId: z
    .number({ required_error: "Customer is required" })
    .int()
    .positive("Select a customer"),
  warehouseId: z
    .number({ required_error: "Warehouse is required" })
    .int()
    .positive("Select a warehouse"),
  discount: z
    .number()
    .min(0, "Discount cannot be negative")
    .default(0),
  items: z
    .array(
      invoiceItemSchema.extend({
        sellingPrice: z
          .number({ required_error: "Price is required" })
          .positive("Price must be greater than 0"),
      })
    )
    .min(1, "At least one item is required"),
});

// ——————————————————————————————
// Purchase Invoice
// ——————————————————————————————
export const purchaseInvoiceSchema = z.object({
  supplierId: z
    .number({ required_error: "Supplier is required" })
    .int()
    .positive("Select a supplier"),
  warehouseId: z
    .number({ required_error: "Warehouse is required" })
    .int()
    .positive("Select a warehouse"),
  items: z
    .array(
      invoiceItemSchema.extend({
        price: z
          .number({ required_error: "Price is required" })
          .positive("Price must be greater than 0"),
      })
    )
    .min(1, "At least one item is required"),
});

// ——————————————————————————————
// Return Invoice (Customer)
// ——————————————————————————————
export const returnInvoiceSchema = z.object({
  customerId: z
    .number({ required_error: "Customer is required" })
    .int()
    .positive("Select a customer"),
  salesInvoiceId: z
    .number({ required_error: "Sales invoice is required" })
    .int()
    .positive("Select a sales invoice"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason is too long"),
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one item is required"),
});

// ——————————————————————————————
// Return Purchase Invoice (Supplier)
// ——————————————————————————————
export const returnPurchaseInvoiceSchema = z.object({
  supplierId: z
    .number({ required_error: "Supplier is required" })
    .int()
    .positive("Select a supplier"),
  purchaseInvoiceId: z
    .number({ required_error: "Purchase invoice is required" })
    .int()
    .positive("Select a purchase invoice"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason is too long"),
  items: z
    .array(
      invoiceItemSchema.extend({
        price: z
          .number({ required_error: "Price is required" })
          .positive("Price must be greater than 0"),
      })
    )
    .min(1, "At least one item is required"),
});

// ——————————————————————————————
// Internal Invoice (Transfer)
// ——————————————————————————————
export const internalInvoiceSchema = z.object({
  fromWarehouseId: z
    .number({ required_error: "Source warehouse is required" })
    .int()
    .positive("Select source warehouse"),
  toWarehouseId: z
    .number({ required_error: "Destination warehouse is required" })
    .int()
    .positive("Select destination warehouse"),
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one item is required"),
}).refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
  message: "Source and destination warehouses must be different",
  path: ["toWarehouseId"],
});

// ——————————————————————————————
// Infer Types (optional — use if you want form types from schemas)
// ——————————————————————————————
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type SupplierFormData = z.infer<typeof supplierSchema>;
export type WarehouseFormData = z.infer<typeof warehouseSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type SalesInvoiceFormData = z.infer<typeof salesInvoiceSchema>;
export type PurchaseInvoiceFormData = z.infer<typeof purchaseInvoiceSchema>;
export type ReturnInvoiceFormData = z.infer<typeof returnInvoiceSchema>;
export type ReturnPurchaseInvoiceFormData = z.infer<typeof returnPurchaseInvoiceSchema>;
export type InternalInvoiceFormData = z.infer<typeof internalInvoiceSchema>;

