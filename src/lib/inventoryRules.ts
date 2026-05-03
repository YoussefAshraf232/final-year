import { WarehouseStock } from "@/types/inventory.types";

export function isLowStock(stock: Pick<WarehouseStock, "availableQuantity" | "reorderLevel">) {
  return stock.availableQuantity <= stock.reorderLevel;
}

export function suggestedReorderQuantity(
  stock: Pick<WarehouseStock, "availableQuantity" | "reorderLevel" | "maximumStock" | "reorderQuantity">
) {
  if (!isLowStock(stock)) return 0;
  if (stock.reorderQuantity && stock.reorderQuantity > 0) return stock.reorderQuantity;
  if (stock.maximumStock && stock.maximumStock > stock.availableQuantity) {
    return stock.maximumStock - stock.availableQuantity;
  }
  return Math.max(stock.reorderLevel - stock.availableQuantity, 0);
}
