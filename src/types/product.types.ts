import { Category } from "./category.types";
import { Supplier } from "./supplier.types";
import { User } from "./user.types";

export interface Product {
  id: number;
  name: string;
  description: string;
  photo: string;
  currentPrice: number;
  categoryId: number;
  userId: number;
  supplierId: number;
  category?: Category;
  user?: User;
  supplier?: Supplier;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  photo: string;
  currentPrice: number;
  categoryId: number;
  supplierId: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  photo?: string;
  currentPrice?: number;
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
