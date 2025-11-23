// app/track/[trackId]/loading.tsx
export default function TrackOrderLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-4 w-24 bg-blue-400 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-48 bg-blue-400 rounded animate-pulse"></div>
              </div>
              <div className="h-12 w-12 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="h-8 w-40 bg-blue-400 rounded-full animate-pulse"></div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Description */}
          <div className="p-6 bg-blue-50 border-b border-gray-200">
            <div className="h-4 w-full bg-blue-200 rounded animate-pulse"></div>
          </div>

          {/* Progress Timeline */}
          <div className="p-6">
            <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status History */}
          <div className="p-6 border-t border-gray-200">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
          <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
      </div>
    </div>
  );
}