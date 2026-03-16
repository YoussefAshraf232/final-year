import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type="date"
          className={cn(
            'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
              : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;