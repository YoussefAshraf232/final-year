'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Plus, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

interface InvoiceFormItem {
  productId: number | '';
  amount: number;
  price?: number | '';
  sellingPrice?: number | '';
}

interface InvoiceFormValues {
  customerId?: number | '';
  supplierId?: number | '';
  warehouseId?: number | '';
  discount?: number | '';
  reason?: string;
  salesInvoiceId?: number | '';
  purchaseInvoiceId?: number | '';
  sourceWarehouseId?: number | '';
  destinationWarehouseId?: number | '';
  items: InvoiceFormItem[];
}

interface InvoiceFormProps {
  fields: {
    name: string;
    label: string;
    type: 'select' | 'text' | 'number';
    options?: { value: string | number; label: string }[];
    placeholder?: string;
  }[];
  itemPriceField?: 'price' | 'sellingPrice' | null;
  onSubmit: (data: InvoiceFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function InvoiceForm({
  fields,
  itemPriceField = 'sellingPrice',
  onSubmit,
  isLoading,
  submitLabel = 'Create Invoice',
}: InvoiceFormProps) {
  const { register, handleSubmit, control } = useForm<InvoiceFormValues>({
    defaultValues: {
      ...Object.fromEntries(fields.map((f) => [f.name, ''])),
      items: [
        {
          productId: '',
          amount: 1,
          ...(itemPriceField ? { [itemPriceField]: '' } : {}),
        },
      ],
    } as InvoiceFormValues,
  });

  const { fields: itemFields, append, remove } = useFieldArray<InvoiceFormValues, 'items'>({
    control,
    name: 'items',
  });

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useProducts({ size: 200 });
  const productOptions = (productsData?.content || []).map((p) => ({
    value: p.id,
    label: `${p.name} - $${p.currentPrice}`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {fields.map((field) =>
            field.type === 'select' ? (
              <Select
                key={field.name}
                id={field.name}
                label={field.label}
                placeholder={field.placeholder}
                options={field.options || []}
                {...register(field.name as keyof InvoiceFormValues & string, { valueAsNumber: true })}
              />
            ) : (
              <Input
                key={field.name}
                id={field.name}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                {...register(field.name as keyof InvoiceFormValues & string, {
                  valueAsNumber: field.type === 'number',
                })}
              />
            )
          )}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                productId: '',
                amount: 1,
                ...(itemPriceField ? { [itemPriceField]: '' } : {}),
              })
            }
          >
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {itemFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:grid-cols-[minmax(0,1fr)_7rem_9rem_auto] sm:items-end"
            >
              <div>
                <Select
                  id={`items.${index}.productId`}
                  label="Product"
                  placeholder={isProductsLoading ? 'Loading products...' : 'Select product'}
                  options={productOptions}
                  disabled={isProductsLoading || isProductsError}
                  {...register(`items.${index}.productId`, { valueAsNumber: true })}
                />
                {isProductsError && (
                  <p className="mt-1.5 text-xs text-red-500">Products could not be loaded.</p>
                )}
              </div>
              <Input
                id={`items.${index}.amount`}
                label="Qty"
                type="number"
                min={1}
                {...register(`items.${index}.amount`, { valueAsNumber: true })}
              />
              {itemPriceField && (
                <Input
                  id={`items.${index}.${itemPriceField}`}
                  label="Price"
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.${itemPriceField}`, { valueAsNumber: true })}
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={itemFields.length <= 1}
                className="justify-self-start sm:mb-0.5"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
