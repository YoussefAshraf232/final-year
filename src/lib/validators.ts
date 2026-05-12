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
  identifier: z
    .string()
    .min(1, "Email or username is required")
    .min(3, "Email or username must be at least 3 characters"),
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
    .max(50, "SKU is too long"),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional(),
  pictureUrl: safeImageUrl,
  currentPrice: nonNegativeNumber(
    "Price is required",
    "Price cannot be negative"
  ),
  costPrice: z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0, "Cost price cannot be negative")
    )
    .optional(),
  reorderLevel: z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().min(0, "Reorder level cannot be negative")
    )
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"]).optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
  supplierId: positiveInt("Select a supplier", "Select a supplier").optional(),
});

export const customerSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name is required")
    .max(200, "Name is too long"),
  phone: z
    .string()
    .max(20, "Phone is too long")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(500, "Address is too long")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(2000, "Notes are too long")
    .optional()
    .or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, "Supplier name is required")
    .max(200, "Name is too long"),
  address: z.string().max(500, "Address is too long").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone is too long").optional().or(z.literal("")),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email is too long")
    .optional()
    .or(z.literal("")),
  contactPerson: z
    .string()
    .max(100, "Contact person is too long")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(2000, "Notes are too long").optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const warehouseSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address is too long"),
  isCentral: z.boolean(),
});

// Mirrors the backend CreateUserRequest:
//   username, firstName?, lastName?, phoneNumber (required), email,
//   password, roleId (required).
// Pages that build a "create user" form should call /roles to populate
// a dropdown and submit the chosen roleId.
export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long"),
  firstName: z.string().max(30, "First name is too long").optional(),
  lastName: z.string().max(30, "Last name is too long").optional(),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  roleId: positiveInt("Role is required", "Select a role"),
});

// Mirrors the backend UpdateUserRequest. System admins can update account
// credentials and details through the user management screen.
export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long")
    .optional(),
  firstName: z.string().max(30, "First name is too long").optional(),
  lastName: z.string().max(30, "Last name is too long").optional(),
  phoneNumber: z.string().max(20, "Phone number is too long").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(255, "Password is too long")
      .optional()
  ),
  roleId: z.number().int().positive("Select a role").optional(),
  warehouseIds: z.array(z.number().int().positive()).optional(),
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
    sourceWarehouseId: positiveInt(
      "Source warehouse is required",
      "Select source warehouse"
    ),
    destinationWarehouseId: positiveInt(
      "Destination warehouse is required",
      "Select destination warehouse"
    ),
    items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  })
  .refine(
    (data) => data.sourceWarehouseId !== data.destinationWarehouseId,
    {
      message: "Source and destination warehouses must be different",
      path: ["destinationWarehouseId"],
    }
  );

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
