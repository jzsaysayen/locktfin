import Sidebar from "@/components/sidebar";

export default function ReservationsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/staff/reservations" />
      <main className="ml-64 p-8">
        {/* Header Loading */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Loading */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="pb-4 px-1">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters Loading */}
        <div className="mb-6 flex gap-4">
          {/* Search Bar Loading */}
          <div className="flex-1">
            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Status Filter Loading */}
          <div className="flex gap-2">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Loading Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reservation ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Drop-off Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Slot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(10)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-28 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-8 w-32 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Loading */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
              
              <div className="flex items-center gap-2">
                <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="h-9 w-9 bg-gray-200 rounded-md animate-pulse"></div>
                  ))}
                </div>
                <div className="h-9 w-16 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}