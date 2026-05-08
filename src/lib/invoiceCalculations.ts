export interface InvoiceCalculationLine {
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxRate?: number;
}

export interface CalculatedInvoiceLine {
  lineSubtotal: number;
  lineDiscountAmount: number;
  taxableAmount: number;
  lineTaxAmount: number;
  lineTotal: number;
}

export interface CalculatedInvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  lines: CalculatedInvoiceLine[];
}

const percent = (value = 0) => Math.min(Math.max(value, 0), 100);
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateInvoiceLine(line: InvoiceCalculationLine): CalculatedInvoiceLine {
  const quantity = Math.max(line.quantity, 0);
  const unitPrice = Math.max(line.unitPrice, 0);
  const lineSubtotal = money(quantity * unitPrice);
  const lineDiscountAmount = money(lineSubtotal * (percent(line.discountPercent) / 100));
  const taxableAmount = money(lineSubtotal - lineDiscountAmount);
  const lineTaxAmount = money(taxableAmount * (percent(line.taxRate) / 100));

  return {
    lineSubtotal,
    lineDiscountAmount,
    taxableAmount,
    lineTaxAmount,
    lineTotal: money(taxableAmount + lineTaxAmount),
  };
}

export function calculateInvoiceTotals(
  lines: InvoiceCalculationLine[],
  invoiceDiscountPercent = 0
): CalculatedInvoiceTotals {
  const calculatedLines = lines.map(calculateInvoiceLine);
  const subtotal = money(calculatedLines.reduce((sum, line) => sum + line.lineSubtotal, 0));
  const lineDiscounts = money(calculatedLines.reduce((sum, line) => sum + line.lineDiscountAmount, 0));
  const invoiceDiscountAmount = money((subtotal - lineDiscounts) * (percent(invoiceDiscountPercent) / 100));
  const taxAmount = money(calculatedLines.reduce((sum, line) => sum + line.lineTaxAmount, 0));
  const totalBeforeInvoiceDiscount = calculatedLines.reduce((sum, line) => sum + line.lineTotal, 0);

  return {
    subtotal,
    discountAmount: money(lineDiscounts + invoiceDiscountAmount),
    taxAmount,
    totalAmount: money(totalBeforeInvoiceDiscount - invoiceDiscountAmount),
    lines: calculatedLines,
  };
}
