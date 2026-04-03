import { Skeleton } from "@/components/ui/skeleton"

export function BeerCardSkeleton() {
  return (
    <div className="overflow-hidden h-full rounded-lg border bg-card shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="flex-shrink-0">
          <Skeleton className="h-32 w-24 rounded-md sm:h-40 sm:w-32" />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
