'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Plus, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

interface InvoiceFormItem {
  productId: number;
  amount: number;
  price?: number;
  sellingPrice?: number;
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
  onSubmit: (data: any) => void;
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
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      ...Object.fromEntries(fields.map((f) => [f.name, ''])),
      items: [{ productId: '', amount: 1, ...(itemPriceField ? { [itemPriceField]: '' } : {}) }],
    },
  });

  const { fields: itemFields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const { data: productsData } = useProducts({ size: 200 });
  const productOptions = (productsData?.content || []).map((p) => ({
    value: p.id,
    label: `${p.name} — $${p.currentPrice}`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top-level fields */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) =>
            field.type === 'select' ? (
              <Select
                key={field.name}
                id={field.name}
                label={field.label}
                placeholder={field.placeholder}
                options={field.options || []}
                {...register(field.name, { valueAsNumber: true })}
              />
            ) : (
              <Input
                key={field.name}
                id={field.name}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                {...register(field.name, {
                  valueAsNumber: field.type === 'number',
                })}
              />
            )
          )}
        </div>
      </Card>

      {/* Items */}
      <Card>
        <div className="flex items-center justify-between mb-4">
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
              className="flex items-end gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100"
            >
              <div className="flex-1">
                <Select
                  id={`items.${index}.productId`}
                  label="Product"
                  placeholder="Select product"
                  options={productOptions}
                  {...register(`items.${index}.productId`, { valueAsNumber: true })}
                />
              </div>
              <div className="w-28">
                <Input
                  id={`items.${index}.amount`}
                  label="Qty"
                  type="number"
                  min={1}
                  {...register(`items.${index}.amount`, { valueAsNumber: true })}
                />
              </div>
              {itemPriceField && (
                <div className="w-36">
                  <Input
                    id={`items.${index}.${itemPriceField}`}
                    label="Price"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.${itemPriceField}`, { valueAsNumber: true })}
                  />
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={itemFields.length <= 1}
                className="mb-0.5"
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