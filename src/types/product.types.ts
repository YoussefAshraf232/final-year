import { Category } from "./category.types";
import { Supplier } from "./supplier.types";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface Product {
  id: number;
  name: string;
  sku?: string | null;
  description?: string | null;
  pictureUrl?: string | null;
  currentPrice: number;
  costPrice?: number | null;
  reorderLevel?: number | null;
  status?: ProductStatus;
  stockStatus?: StockStatus;
  totalStock?: number;
  supplier?: Supplier | null;
  categories: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductStockByWarehouse {
  warehouseId: number;
  warehouseName: string;
  amount: number;
  stockStatus: StockStatus;
}

export interface ProductDetail {
  product: Product;
  stockByWarehouse: ProductStockByWarehouse[];
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  pictureUrl?: string;
  currentPrice: number;
  costPrice?: number;
  reorderLevel?: number;
  status?: ProductStatus;
  supplierId?: number;
  categoryIds?: number[];
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  description?: string;
  pictureUrl?: string;
  currentPrice?: number;
  costPrice?: number;
  reorderLevel?: number;
  status?: ProductStatus;
  supplierId?: number;
  categoryIds?: number[];
}

export interface ProductFilterParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
  supplierId?: number;
  stockStatus?: StockStatus;
  status?: ProductStatus;
  sort?: string;
}
