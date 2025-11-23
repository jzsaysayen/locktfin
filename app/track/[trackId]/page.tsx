// app/track/[trackId]/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';

type OrderStatus = 'RECEIVED' | 'IN_PROGRESS' | 'PICKUP' | 'COMPLETE';

interface PageProps {
  params: Promise<{
    trackId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { trackId } = await params;
  return {
    title: `Track Order ${trackId} - LaundryLink`,
    description: 'Track your laundry order status',
  };
}

// Status display configuration
const statusConfig = {
  RECEIVED: {
    label: 'Order Received',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '📦',
    description: 'Your order has been received and is being processed.',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🔄',
    description: 'Your laundry is currently being processed.',
  },
  PICKUP: {
    label: 'Ready for Pickup',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✅',
    description: 'Your order is ready! You can pick it up anytime.',
  },
  COMPLETE: {
    label: 'Complete',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '🎉',
    description: 'Order completed. Thank you for choosing LaundryLink!',
  },
};

export default async function TrackOrderPage({ params }: PageProps) {
  const { trackId } = await params;

  // Fetch order with status history
  const order = await prisma.order.findUnique({
    where: { trackId },
    include: {
      statusHistory: {
        orderBy: {
          timestamp: 'desc',
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const currentStatus = statusConfig[order.status as OrderStatus];
  const allStatuses: OrderStatus[] = ['RECEIVED', 'IN_PROGRESS', 'PICKUP', 'COMPLETE'];
  const currentStatusIndex = allStatuses.indexOf(order.status as OrderStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Stay updated on your laundry status</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm mb-1">Tracking ID</p>
                <p className="text-2xl font-bold">{order.trackId}</p>
              </div>
              <div className="text-5xl">{currentStatus.icon}</div>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${currentStatus.color} border`}>
              <span className="font-semibold">{currentStatus.label}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Number</p>
                <p className="font-medium text-gray-900">{order.customerNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{order.customerEmail}</p>
              </div>
              {order.status === 'PICKUP' || order.status === 'COMPLETE' ? (
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-bold text-green-600 text-xl">₱{order.price.toFixed(2)}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Status Description */}
          <div className="p-6 bg-blue-50 border-b border-gray-200">
            <p className="text-gray-700">{currentStatus.description}</p>
          </div>

          {/* Progress Timeline */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
              <div 
                className="absolute left-4 top-4 w-0.5 bg-blue-600 transition-all duration-500"
                style={{ height: `${(currentStatusIndex / (allStatuses.length - 1)) * 100}%` }}
              ></div>

              {/* Status Steps */}
              <div className="space-y-6 relative">
                {allStatuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const config = statusConfig[status];

                  return (
                    <div key={status} className="flex items-start gap-4 relative">
                      {/* Circle Indicator */}
                      <div 
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center z-10 border-2
                          ${isCompleted 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'bg-white border-gray-300'
                          }
                          ${isCurrent ? 'ring-4 ring-blue-200' : ''}
                        `}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        )}
                      </div>

                      {/* Status Info */}
                      <div className={`flex-1 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                        <p className={`font-semibold ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                          {config.icon} {config.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {order.notes && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Additional Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          {/* Status History */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Status History</h3>
            <div className="space-y-3">
              {order.statusHistory.map((history) => (
                <div key={history.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{statusConfig[history.status as OrderStatus].icon}</span>
                    <span className="text-gray-900 font-medium">
                      {statusConfig[history.status as OrderStatus].label}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(history.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="text-sm">
            Questions? Contact us for assistance.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Keep this tracking ID for your records
          </p>
        </div>
      </div>
    </div>
  );
}