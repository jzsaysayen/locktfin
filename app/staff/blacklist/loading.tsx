import Sidebar from "@/components/sidebar";

export default function BlacklistLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/staff/blacklist" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add entry form skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              <div>
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-16 w-full bg-gray-100 rounded-lg animate-pulse" />
              </div>
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* List skeleton */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-64 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}