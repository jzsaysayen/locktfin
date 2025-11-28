import Sidebar from "@/components/sidebar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/dashboard" />
      <main className="ml-64 p-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Today's Statuses Skeleton */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-white rounded shadow">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-7 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Backlogs Section */}
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-yellow-50 rounded shadow">
              <div className="h-4 w-32 bg-yellow-200 rounded animate-pulse mb-3"></div>
              <div className="h-7 w-12 bg-yellow-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Completed Section */}
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 bg-green-50 rounded shadow">
              <div className="h-4 w-24 bg-green-200 rounded animate-pulse mb-3"></div>
              <div className="h-7 w-12 bg-green-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton - Last 7 Days */}
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="p-4 bg-white rounded shadow mb-8">
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>

        {/* Average Turnaround */}
        <div className="h-6 w-56 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="p-4 bg-white rounded shadow mb-8">
          <div className="h-7 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Turnaround Chart Skeleton */}
        <div className="h-6 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="p-4 bg-white rounded shadow mb-8">
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </main>
    </div>
  );
}