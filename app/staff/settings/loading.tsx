// app/settings/loading.tsx
import Sidebar from "@/components/sidebar";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/settings" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="max-w-4xl">
          {/* Email Settings Section Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Resend API Key Field */}
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-96 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>

              {/* Email From Address Field */}
              <div>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-80 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>

              {/* Email Subject Field */}
              <div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Email Message Field */}
              <div>
                <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Save Button */}
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Available Variables Info Skeleton */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="h-5 w-40 bg-blue-200 rounded animate-pulse mb-3"></div>
            <div className="h-4 w-full bg-blue-200 rounded animate-pulse mb-3"></div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 bg-blue-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Instructions Skeleton */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <div className="h-5 w-56 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}