export interface Supplier {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
}

export interface CreateSupplierRequest {
  name: string;
  address: string;
  phoneNumber: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  address?: string;
  phoneNumber?: string;
}
