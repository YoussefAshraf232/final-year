'use client';

import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function StockRequestEditPage() {
  return (
    <>
      <Topbar title="Request Stock Edit" subtitle="Warehouse edit requests and review flow" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Stock' }, { label: 'Request Stock Edit' }]} />
        <Card>
          <div className="space-y-4 py-12 text-center">
            <p className="text-lg font-semibold text-gray-900">Stock edit requests need backend support</p>
            <p className="text-sm text-gray-500">
              This page is a placeholder for the warehouse stock edit request workflow. The frontend is ready,
              but the backend endpoint for submitting stock edit requests has not been implemented yet.
            </p>
            <div className="mx-auto max-w-md text-left">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Warehouse team members can request quantity corrections.</li>
                <li>• Managers should review and approve edit requests in the backend.</li>
                <li>• No live integration exists until the backend supports POST /stock/edit-requests.</li>
              </ul>
            </div>
            <Button variant="outline" disabled>
              Request feature pending backend support
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
