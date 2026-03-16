'use client';

import { AlertTriangle } from 'lucide-react';
import Card, { CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface LowStockItem {
  productId: number;
  productName: string;
  currentStock: number;
  minThreshold: number;
  warehouseName: string;
}

interface LowStockAlertProps {
  items: LowStockItem[];
  isLoading?: boolean;
}

export default function LowStockAlert({ items, isLoading }: LowStockAlertProps) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <CardTitle>Low Stock Alerts</CardTitle>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-2 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No low stock alerts 🎉
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.warehouseName}`}
              className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.productName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.warehouseName}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="warning">
                  {item.currentStock} / {item.minThreshold}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}