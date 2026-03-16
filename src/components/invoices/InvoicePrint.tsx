'use client';

import { forwardRef } from 'react';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface PrintItem {
  product?: { name: string };
  productId: number;
  amount: number;
  price?: number;
  sellingPrice?: number;
}

interface InvoicePrintProps {
  invoice: {
    id: number;
    createdAt: string;
    totalPrice: number;
    discount?: number;
    items?: PrintItem[];
  };
  type: string;
  partyName?: string;
  partyLabel?: string;
  priceField?: 'price' | 'sellingPrice';
}

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoice, type, partyName, partyLabel, priceField = 'sellingPrice' }, ref) => {
    const getPrice = (item: PrintItem) =>
      priceField === 'sellingPrice' ? item.sellingPrice : item.price;

    return (
      <div ref={ref} className="p-8 bg-white text-gray-900 max-w-2xl mx-auto print:p-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-indigo-700">Inventory MS</h1>
            <p className="text-sm text-gray-500 mt-1">Management System</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold uppercase text-gray-700">{type}</h2>
            <p className="text-sm text-gray-500">#{invoice.id}</p>
            <p className="text-sm text-gray-500">{formatDate(invoice.createdAt)}</p>
          </div>
        </div>

        {/* Party info */}
        {partyName && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {partyLabel || 'Bill To'}
            </p>
            <p className="text-sm font-medium mt-1">{partyName}</p>
          </div>
        )}

        {/* Items table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-2 text-left font-semibold text-gray-600">#</th>
              <th className="py-2 text-left font-semibold text-gray-600">Product</th>
              <th className="py-2 text-right font-semibold text-gray-600">Qty</th>
              {priceField && (
                <>
                  <th className="py-2 text-right font-semibold text-gray-600">Price</th>
                  <th className="py-2 text-right font-semibold text-gray-600">Total</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, i) => (
              <tr key={item.productId} className="border-b border-gray-100">
                <td className="py-2 text-gray-500">{i + 1}</td>
                <td className="py-2">{item.product?.name || `Product #${item.productId}`}</td>
                <td className="py-2 text-right">{item.amount}</td>
                {priceField && (
                  <>
                    <td className="py-2 text-right">
                      {getPrice(item) !== undefined ? formatCurrency(getPrice(item)!) : '—'}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {getPrice(item) !== undefined
                        ? formatCurrency(getPrice(item)! * item.amount)
                        : '—'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            {invoice.discount !== undefined && invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t-2 border-gray-200 pt-2">
              <span>Total</span>
              <span>{formatCurrency(invoice.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Thank you for your business!</p>
          <p className="mt-1">Inventory Management System</p>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = 'InvoicePrint';
export default InvoicePrint;