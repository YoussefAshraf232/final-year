import { z } from "zod";

const userRoles = ["ADMIN", "MANAGER", "EMPLOYEE"] as const;
const ALLOWED_IMAGE_DOMAINS = [
  "images.unsplash.com",
  "your-cdn.example.com",
];

const requiredNumber = (message: string, schema = z.number({ error: message })) =>
  z.preprocess(
    (value) => (value === "" || Number.isNaN(value) ? undefined : value),
    schema
  );

const positiveNumber = (requiredMessage: string, positiveMessage: string) =>
  requiredNumber(
    requiredMessage,
    z.number({ error: requiredMessage }).positive(positiveMessage)
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

      try {
        const parsed = new URL(url);
        return (
          parsed.protocol === "https:" &&
          ALLOWED_IMAGE_DOMAINS.includes(parsed.hostname)
        );
      } catch {
        return false;
      }
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
  role: z.enum(userRoles, { error: "Role is required" }),
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
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  photo: safeImageUrl,
  currentPrice: positiveNumber(
    "Price is required",
    "Price must be greater than 0"
  ),
  categoryId: positiveInt("Select a category", "Select a category"),
  supplierId: positiveInt("Select a supplier", "Select a supplier"),
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
});

export const salesInvoiceSchema = z.object({
  customerId: positiveInt("Customer is required", "Select a customer"),
  warehouseId: positiveInt("Warehouse is required", "Select a warehouse"),
  discount: z.number().min(0, "Discount cannot be negative").default(0),
  items: z
    .array(
      invoiceItemSchema.extend({
        sellingPrice: positiveNumber(
          "Price is required",
          "Price must be greater than 0"
        ),
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
        price: positiveNumber(
          "Price is required",
          "Price must be greater than 0"
        ),
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
        price: positiveNumber(
          "Price is required",
          "Price must be greater than 0"
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
