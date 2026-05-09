import { z } from "zod";
import { isAllowedImageUrl } from "./imageSafety";

const userRoles = [
  "ADMIN",
  "MANAGER",
  "EMPLOYEE",
  "SYSTEM_ADMIN",
  "OPERATIONAL_MANAGER",
  "WAREHOUSE_MANAGER",
] as const;
const requiredNumber = (message: string, schema = z.number({ error: message })) =>
  z.preprocess(
    (value) => (value === "" || Number.isNaN(value) ? undefined : value),
    schema
  );

const nonNegativeNumber = (requiredMessage: string, message: string) =>
  requiredNumber(
    requiredMessage,
    z.number({ error: requiredMessage }).min(0, message)
  );

const positiveInt = (requiredMessage: string, positiveMessage: string) =>
  requiredNumber(
    requiredMessage,
    z.number({ error: requiredMessage }).int().positive(positiveMessage)
  );

const safeImageUrl = z
  .string()
  .optional()
  .refine(
    (url) => {
      if (!url) return true;
      return isAllowedImageUrl(url);
    },
    { message: "Image must be HTTPS and from an allowed domain" }
  );

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
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name is too long"),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name is too long"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(100, "SKU is too long"),
  barcode: z.string().max(100, "Barcode is too long").optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  photo: safeImageUrl,
  unitOfMeasure: z
    .string()
    .min(1, "Unit of measure is required")
    .max(30, "Unit of measure is too long"),
  brand: z.string().max(100, "Brand is too long").optional(),
  manufacturer: z.string().max(100, "Manufacturer is too long").optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"]).default("ACTIVE"),
  currentPrice: nonNegativeNumber(
    "Price is required",
    "Price cannot be negative"
  ),
  costPrice: nonNegativeNumber(
    "Cost price is required",
    "Cost price cannot be negative"
  ),
  openingStock: nonNegativeNumber(
    "Opening stock is required",
    "Opening stock cannot be negative"
  ),
  reorderLevel: nonNegativeNumber(
    "Reorder level is required",
    "Reorder level cannot be negative"
  ),
  taxCategory: z.string().max(100, "Tax category is too long").optional(),
  isSerialTracked: z.boolean().default(false),
  isBatchTracked: z.boolean().default(false),
  categoryId: positiveInt("Select a category", "Select a category"),
  supplierId: positiveInt("Select a supplier", "Select a supplier"),
}).refine((data) => !(data.isSerialTracked && data.isBatchTracked), {
  message: "Choose serial tracking or batch tracking, not both",
  path: ["isBatchTracked"],
});

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

export const warehouseSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address is too long"),
  isCentral: z.boolean(),
});

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
  role: z.enum(userRoles, { error: "Role is required" }),
});

export const updateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(userRoles).optional(),
});

const invoiceItemSchema = z.object({
  productId: positiveInt("Product is required", "Select a product"),
  amount: positiveInt("Amount is required", "Amount must be at least 1"),
  discountPercent: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").default(0),
  taxRate: z.number().min(0, "Tax cannot be negative").max(100, "Tax cannot exceed 100%").default(0),
});

export const salesInvoiceSchema = z.object({
  customerId: positiveInt("Customer is required", "Select a customer"),
  warehouseId: positiveInt("Warehouse is required", "Select a warehouse"),
  discount: z.number().min(0, "Discount cannot be negative").default(0),
  invoiceDiscountPercent: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").default(0),
  items: z
    .array(
      invoiceItemSchema.extend({
        sellingPrice: nonNegativeNumber(
          "Price is required",
          "Price cannot be negative"
        ),
        serialNumbers: z.array(z.string().min(1)).optional(),
        batchId: z.number().int().positive().optional(),
      })
    )
    .min(1, "At least one item is required"),
});

export const purchaseInvoiceSchema = z.object({
  supplierId: positiveInt("Supplier is required", "Select a supplier"),
  warehouseId: positiveInt("Warehouse is required", "Select a warehouse"),
  items: z
    .array(
      invoiceItemSchema.extend({
        price: nonNegativeNumber(
          "Price is required",
          "Price cannot be negative"
        ),
        serialNumbers: z.array(z.string().min(1)).optional(),
        batchId: z.number().int().positive().optional(),
      })
    )
    .min(1, "At least one item is required"),
});

export const returnInvoiceSchema = z.object({
  customerId: positiveInt("Customer is required", "Select a customer"),
  salesInvoiceId: positiveInt("Sales invoice is required", "Select a sales invoice"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason is too long"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

export const returnPurchaseInvoiceSchema = z.object({
  supplierId: positiveInt("Supplier is required", "Select a supplier"),
  purchaseInvoiceId: positiveInt(
    "Purchase invoice is required",
    "Select a purchase invoice"
  ),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason is too long"),
  items: z
    .array(
      invoiceItemSchema.extend({
        price: nonNegativeNumber(
          "Price is required",
          "Price cannot be negative"
        ),
      })
    )
    .min(1, "At least one item is required"),
});

export const internalInvoiceSchema = z
  .object({
    fromWarehouseId: positiveInt(
      "Source warehouse is required",
      "Select source warehouse"
    ),
    toWarehouseId: positiveInt(
      "Destination warehouse is required",
      "Select destination warehouse"
    ),
    items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  })
  .refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: "Source and destination warehouses must be different",
    path: ["toWarehouseId"],
  });

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
export type ReturnPurchaseInvoiceFormData = z.infer<
  typeof returnPurchaseInvoiceSchema
>;
export type InternalInvoiceFormData = z.infer<typeof internalInvoiceSchema>;
