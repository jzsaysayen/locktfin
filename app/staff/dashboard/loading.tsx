import Sidebar from "@/components/sidebar";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/staff/dashboard" />
      <main className="ml-64 p-8">
        {/* Header Loading */}
        <div className="mb-8">
          <div className="h-9 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Alerts Loading - 3 possible alerts */}
        <div className="mb-8 space-y-3">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="bg-gray-100 border-l-4 border-gray-300 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-96 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse ml-4"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Today's Overview - Cards + Pie Chart Loading */}
        <div className="mb-8">
          <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart Loading */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-48 h-48 bg-gray-200 rounded-full animate-pulse mb-4"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Stats Cards Loading */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-3"></div>
                      <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Backlogs Loading */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="h-7 w-36 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-9 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Week/Month Loading */}
        <div className="mb-8">
          <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-36 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Chart Loading */}
        <div className="mb-8">
          <div className="h-7 w-44 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-4 w-full max-w-2xl bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Average Turnaround Loading */}
        <div className="mb-8">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 w-44 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-10 w-56 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="bg-white/60 rounded-lg p-4 max-w-xl">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Turnaround Trend Loading */}
        <div className="mb-8">
          <div className="h-7 w-52 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-4 w-full max-w-xl bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  );
}