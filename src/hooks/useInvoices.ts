"use client";

// Re-export all invoice hooks from one place for convenience
// This file is just an aggregator

export { useSalesInvoices, useSalesInvoice, useCreateSalesInvoice, useDeleteSalesInvoice } from "./useSalesInvoices";
export { usePurchaseInvoices, usePurchaseInvoice, useCreatePurchaseInvoice, useDeletePurchaseInvoice } from "./usePurchaseInvoices";
export { useReturnInvoices, useReturnInvoice, useCreateReturnInvoice, useDeleteReturnInvoice } from "./useReturnInvoices";
export { useReturnPurchaseInvoices, useReturnPurchaseInvoice, useCreateReturnPurchaseInvoice, useDeleteReturnPurchaseInvoice } from "./useReturnPurchaseInvoices";
export { useInternalInvoices, useInternalInvoice, useCreateInternalInvoice, useDeleteInternalInvoice } from "./useInternalInvoices";
