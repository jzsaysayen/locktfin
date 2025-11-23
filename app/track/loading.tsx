// app/track/loading.tsx
export default function TrackLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-block p-3 sm:p-4 bg-blue-400 rounded-full mb-3 sm:mb-4 animate-pulse">
            <div className="w-8 h-8 sm:w-12 sm:h-12"></div>
          </div>
          <div className="h-8 sm:h-10 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-2 sm:mb-3"></div>
          <div className="h-5 sm:h-6 w-72 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>

        {/* Main Card Skeleton */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mx-2 sm:mx-0">
          <div className="p-4 sm:p-8">
            {/* Input Skeleton */}
            <div className="mb-6 sm:mb-8">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2 sm:mb-3"></div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-full sm:w-28 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-medium">OR</span>
              </div>
            </div>

            {/* QR Options Skeleton */}
            <div className="space-y-3 sm:space-y-4">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mx-auto mb-3 sm:mb-4"></div>
              
              {/* Button Skeletons */}
              <div className="w-full h-14 bg-gradient-to-r from-purple-300 to-blue-300 rounded-xl animate-pulse"></div>
              <div className="w-full h-14 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Info Section Skeleton */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mx-2 sm:mx-0">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
          </div>
        </div>

        {/* Note Skeleton */}
        <div className="mt-4 sm:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mx-2 sm:mx-0">
          <div className="space-y-2">
            <div className="h-3 bg-yellow-200 rounded animate-pulse w-full"></div>
            <div className="h-3 bg-yellow-200 rounded animate-pulse w-4/5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}