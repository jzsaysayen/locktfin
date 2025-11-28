// app/addOrder/loading.tsx
import Sidebar from "@/components/sidebar";

export default function AddOrderLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/addOrder" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 space-y-6">
              {/* Customer Name Field */}
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Customer Number Field */}
              <div>
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Customer Email Field */}
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-64 bg-gray-200 rounded animate-pulse mt-1"></div>
              </div>

              {/* Notes Field */}
              <div>
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Send Email Checkbox */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-4 w-4 bg-blue-200 rounded animate-pulse mt-1"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-64 bg-blue-200 rounded animate-pulse"></div>
                    <div className="h-3 w-full bg-blue-200 rounded animate-pulse"></div>
                    <div className="h-3 w-5/6 bg-blue-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}