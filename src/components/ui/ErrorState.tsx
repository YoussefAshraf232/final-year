import Button from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = "Could not load data",
  message = "Please check your connection and try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={className}>
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-red-700">{message}</p>
          </div>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
