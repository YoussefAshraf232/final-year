'use client';

import { LucideIcon } from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBg?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
}: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5">
              {trend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs last month
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
    </Card>
  );
}