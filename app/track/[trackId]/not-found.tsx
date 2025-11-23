// app/track/[trackId]/not-found.tsx
import Link from 'next/link';

export default function TrackingNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-8">
            We couldn`t find an order with this tracking ID. Please check the ID and try again.
          </p>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-900 mb-2">💡 Tips:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Double-check your tracking ID</li>
              <li>• Make sure there are no extra spaces</li>
              <li>• Check your email for the correct tracking link</li>
              <li>• Contact us if you need assistance</li>
            </ul>
          </div>

          {/* Action Button */}
          <Link
            href="/"
            className="inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}