'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Product } from '@/types/product.types';
import { formatCurrency } from '@/lib/formatters';
import { ROUTES } from '@/constants/routes';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(ROUTES.PRODUCT_DETAIL(product.id))}
    >
      <div className="aspect-video w-full rounded-lg bg-gray-100 mb-4 overflow-hidden">
        {product.photo ? (
          <img
            src={product.photo}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No Image
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <Badge variant="info">{product.category?.name || '—'}</Badge>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(product.currentPrice)}
          </span>
          <span className="text-xs text-gray-400">{product.supplier?.name}</span>
        </div>
      </div>
    </Card>
  );
}