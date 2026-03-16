'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card, { CardTitle } from '@/components/ui/Card';

interface ChartDataItem {
  month: string;
  total: number;
}

interface SalesChartProps {
  salesData: ChartDataItem[];
  purchaseData: ChartDataItem[];
}

export default function SalesChart({ salesData, purchaseData }: SalesChartProps) {
  // Merge sales and purchase data by month
  const mergedData = salesData.map((sale, index) => ({
    month: sale.month,
    sales: sale.total,
    purchases: purchaseData[index]?.total ?? 0,
  }));

  return (
    <Card>
      <CardTitle>Sales vs Purchase Trends</CardTitle>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              tickFormatter={(val) =>
                val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '13px',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="purchases"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4, fill: '#6366f1' }}
              activeDot={{ r: 6 }}
              name="Purchases"
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4, fill: '#10b981' }}
              activeDot={{ r: 6 }}
              name="Sales"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}