export interface Customer {
  id: number;
  name: string;
  address: string;
}

export interface CreateCustomerRequest {
  name: string;
  address: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  address?: string;
}
