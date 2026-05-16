export const ROUTES = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",

  // Dashboard
  DASHBOARD: "/dashboard",

  // Products
  PRODUCTS: "/products",
  PRODUCT_NEW: "/products/new",
  PRODUCT_DETAIL: (id: number) => `/products/${id}`,
  PRODUCT_EDIT: (id: number) => `/products/${id}/edit`,

  // Categories
  CATEGORIES: "/categories",

  // Warehouses
  WAREHOUSES: "/warehouses",
  WAREHOUSE_NEW: "/warehouses/new",
  WAREHOUSE_DETAIL: (id: number) => `/warehouses/${id}`,
  WAREHOUSE_EDIT: (id: number) => `/warehouses/${id}/edit`,
  WAREHOUSE_STOCK: (id: number) => `/warehouses/${id}/stock`,
  WAREHOUSE_STAFF: (id: number) => `/warehouses/${id}/staff`,

  // Stock
  STOCK: "/stock",
  STOCK_REQUEST_EDIT: "/stock/request-edit",

  // Customers
  CUSTOMERS: "/customers",
  CUSTOMER_NEW: "/customers/new",
  CUSTOMER_DETAIL: (id: number) => `/customers/${id}`,
  CUSTOMER_EDIT: (id: number) => `/customers/${id}/edit`,

  // Suppliers
  SUPPLIERS: "/suppliers",
  SUPPLIER_NEW: "/suppliers/new",
  SUPPLIER_DETAIL: (id: number) => `/suppliers/${id}`,
  SUPPLIER_EDIT: (id: number) => `/suppliers/${id}/edit`,

  // Sales Invoices
  SALES_INVOICES: "/invoices/sales",
  SALES_INVOICE_NEW: "/invoices/sales/new",
  SALES_INVOICE_DETAIL: (id: number) => `/invoices/sales/${id}`,

  // Purchase Invoices
  PURCHASE_INVOICES: "/invoices/purchases",
  PURCHASE_INVOICE_NEW: "/invoices/purchases/new",
  PURCHASE_INVOICE_DETAIL: (id: number) => `/invoices/purchases/${id}`,
  APPROVE_ORDERS: "/invoices/approve",

  // Return Invoices (Customer)
  RETURN_INVOICES: "/invoices/returns",
  RETURN_INVOICE_NEW: "/invoices/returns/new",
  RETURN_INVOICE_DETAIL: (id: number) => `/invoices/returns/${id}`,

  // Return Purchase Invoices (Supplier)
  RETURN_PURCHASE_INVOICES: "/invoices/purchase-returns",
  RETURN_PURCHASE_INVOICE_NEW: "/invoices/purchase-returns/new",
  RETURN_PURCHASE_INVOICE_DETAIL: (id: number) => `/invoices/purchase-returns/${id}`,

  // Internal Invoices (Transfers)
  INTERNAL_INVOICES: "/invoices/transfers",
  INTERNAL_INVOICE_NEW: "/invoices/transfers/new",
  INTERNAL_INVOICE_DETAIL: (id: number) => `/invoices/transfers/${id}`,

  // Users
  USERS: "/users",
  USER_NEW: "/users/new",
  USER_DETAIL: (id: number) => `/users/${id}`,
  USER_EDIT: (id: number) => `/users/${id}/edit`,

  // Reports
  REPORTS: "/reports",
  REPORTS_SALES: "/reports/sales",
  REPORTS_PURCHASES: "/reports/purchases",
  REPORTS_INVENTORY: "/reports/inventory",

  // Audit
  AUDIT_LOGS: "/audit-logs",
  PROFILE: "/profile",
} as const;
