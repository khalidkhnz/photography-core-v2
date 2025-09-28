import { DashboardSkeleton } from "@/components/loading-skeleton";

export default function Loading() {
  return (
    <div className="bg-background flex h-screen">
      {/* Sidebar Skeleton */}
      <div className="bg-card flex h-full w-64 flex-col border-r">
        <div className="flex h-16 items-center border-b px-6">
          <div className="bg-muted h-6 w-32 animate-pulse rounded" />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 rounded-md p-2">
              <div className="bg-muted h-4 w-4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
            </div>
          ))}
        </nav>

        <div className="mt-auto flex flex-col space-y-2 p-4">
          <div className="bg-muted h-10 w-full animate-pulse rounded" />
          <div className="bg-muted h-10 w-full animate-pulse rounded" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header Skeleton */}
        <header className="bg-background flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center space-x-4">
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
            <div className="space-y-1">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-32 animate-pulse rounded" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-muted h-8 w-8 animate-pulse rounded" />
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
          </div>
        </header>

        {/* Dashboard Content Skeleton */}
        <main className="flex-1 overflow-auto p-6">
          <DashboardSkeleton />
        </main>
      </div>
    </div>
  );
}
