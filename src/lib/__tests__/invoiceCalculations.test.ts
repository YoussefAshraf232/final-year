import { describe, expect, it } from "vitest";
import { calculateInvoiceLine, calculateInvoiceTotals } from "../invoiceCalculations";
import { isLowStock, suggestedReorderQuantity } from "../inventoryRules";

describe("invoice calculations", () => {
  it("calculates line discount, tax, and total consistently", () => {
    expect(
      calculateInvoiceLine({
        quantity: 2,
        unitPrice: 100,
        discountPercent: 10,
        taxRate: 14,
      })
    ).toEqual({
      lineSubtotal: 200,
      lineDiscountAmount: 20,
      taxableAmount: 180,
      lineTaxAmount: 25.2,
      lineTotal: 205.2,
    });
  });

  it("calculates invoice totals with line and invoice discounts", () => {
    expect(
      calculateInvoiceTotals(
        [
          { quantity: 2, unitPrice: 100, discountPercent: 10, taxRate: 14 },
          { quantity: 1, unitPrice: 50, taxRate: 0 },
        ],
        5
      )
    ).toMatchObject({
      subtotal: 250,
      discountAmount: 31.5,
      taxAmount: 25.2,
      totalAmount: 243.7,
    });
  });
});

describe("inventory reorder rules", () => {
  it("detects low stock and prefers configured reorder quantity", () => {
    const stock = {
      availableQuantity: 3,
      reorderLevel: 10,
      reorderQuantity: 25,
    };

    expect(isLowStock(stock)).toBe(true);
    expect(suggestedReorderQuantity(stock)).toBe(25);
  });
});
