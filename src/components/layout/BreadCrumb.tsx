import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadCrumbProps {
  items: BreadcrumbItem[];
}

export default function BreadCrumb({ items }: BreadCrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-indigo-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}