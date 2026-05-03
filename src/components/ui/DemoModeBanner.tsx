interface DemoModeBannerProps {
  resource?: string;
}

export default function DemoModeBanner({ resource = "data" }: DemoModeBannerProps) {
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Showing demo {resource}. Guest mode never calls protected APIs and this data is not real.
    </div>
  );
}
