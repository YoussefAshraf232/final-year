'use client';

import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';

export default function ReportsPage() {
  return (
    <>
      <Topbar title="Reports" subtitle="View analytics and business insights" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Reports' }]} />

        <Card>
          <div className="py-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reports Dashboard
            </h3>
            <p className="text-gray-600 mb-6">
              Advanced reporting features coming soon.
            </p>
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">Sales Reports</h4>
                <p className="text-sm text-gray-500">
                  Revenue trends and customer insights
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">Inventory Reports</h4>
                <p className="text-sm text-gray-500">
                  Stock levels and warehouse utilization
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">Purchase Reports</h4>
                <p className="text-sm text-gray-500">
                  Supplier performance and cost analysis
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
