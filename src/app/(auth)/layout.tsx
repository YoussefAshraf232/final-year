import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {children}
      <Toaster position="top-right" />
    </div>
  );
}
