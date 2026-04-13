export default function SkeletonLoader({ className = "", lines = 3 }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 rounded bg-slate-200"></div>
        ))}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card flex animate-pulse flex-col gap-4">
      <div className="h-52 w-full rounded-3xl bg-slate-200"></div>
      <div className="space-y-2">
        <div className="h-5 rounded bg-slate-200"></div>
        <div className="h-4 rounded bg-slate-200"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-6 w-16 rounded bg-slate-200"></div>
        <div className="h-6 w-20 rounded bg-slate-200"></div>
      </div>
    </div>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="h-52 w-full rounded-3xl bg-slate-200"></div>
      <div className="mt-5 space-y-3">
        <div className="h-4 w-24 rounded bg-slate-200"></div>
        <div className="h-6 w-3/4 rounded bg-slate-200"></div>
        <div className="space-y-2">
          <div className="h-4 rounded bg-slate-200"></div>
          <div className="h-4 w-5/6 rounded bg-slate-200"></div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-slate-200"></div>
        <div className="h-8 w-20 rounded-full bg-slate-200"></div>
      </div>
    </div>
  );
}