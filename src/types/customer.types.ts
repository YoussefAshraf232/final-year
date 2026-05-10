export interface Customer {
  id: number;
  name: string;
  phone?: string;
  address: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  address: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  address?: string;
}
