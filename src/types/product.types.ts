import { Category } from "./category.types";
import { Supplier } from "./supplier.types";
import { User } from "./user.types";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
  description: string;
  photo: string;
  currentPrice: number;
  costPrice?: number;
  openingStock?: number;
  reorderLevel?: number;
  unitOfMeasure?: string;
  brand?: string | null;
  manufacturer?: string | null;
  status?: ProductStatus;
  taxCategory?: string | null;
  isSerialTracked?: boolean;
  isBatchTracked?: boolean;
  categoryId: number;
  userId: number;
  supplierId: number;
  category?: Category;
  user?: User;
  supplier?: Supplier;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  barcode?: string;
  description: string;
  photo: string;
  currentPrice: number;
  costPrice: number;
  openingStock: number;
  reorderLevel: number;
  unitOfMeasure: string;
  brand?: string;
  manufacturer?: string;
  status?: ProductStatus;
  taxCategory?: string;
  isSerialTracked?: boolean;
  isBatchTracked?: boolean;
  categoryId: number;
  supplierId: number;
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  photo?: string;
  currentPrice?: number;
  costPrice?: number;
  openingStock?: number;
  reorderLevel?: number;
  unitOfMeasure?: string;
  brand?: string;
  manufacturer?: string;
  status?: ProductStatus;
  taxCategory?: string;
  isSerialTracked?: boolean;
  isBatchTracked?: boolean;
  categoryId?: number;
  supplierId?: number;
}

export interface ProductFilterParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
  supplierId?: number;
  sort?: string;
}
