import { PaginationParams } from './api.types';

export type CustomerStatus = 'ACTIVE' | 'INACTIVE';
export type CustomerSalesActivity = 'HAS_SALES' | 'NO_SALES' | 'HAS_RETURNS';

export interface CustomerActivity {
  id: number;
  reference: string;
  date: string;
  amount: number;
}

export interface Customer {
  id: number;
  customerId?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: CustomerStatus;
  notes?: string;
  totalSales?: number;
  returnsCount?: number;
  createdAt?: string;
  deactivatedAt?: string;
}

export interface CustomerDetail extends Customer {
  totalReturns?: number;
  lastSale?: string;
  lastReturn?: string;
  recentSales?: CustomerActivity[];
  recentReturns?: CustomerActivity[];
}

export interface CustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  customersWithSales: number;
  customersWithReturns: number;
}

export interface CustomerFilterParams extends PaginationParams {
  status?: CustomerStatus | '';
  salesActivity?: CustomerSalesActivity | '';
  createdFrom?: string;
  createdTo?: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status?: CustomerStatus;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status?: CustomerStatus;
}
