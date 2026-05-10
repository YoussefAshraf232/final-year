import { Category } from "./category.types";
import { Supplier } from "./supplier.types";

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  pictureUrl?: string | null;
  currentPrice: number;
  supplier?: Supplier | null;
  categories: Category[];
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  pictureUrl?: string;
  currentPrice: number;
  supplierId?: number;
  categoryIds?: number[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  pictureUrl?: string;
  currentPrice?: number;
  supplierId?: number;
  categoryIds?: number[];
}

export interface ProductFilterParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
  supplierId?: number;
  sort?: string;
}
