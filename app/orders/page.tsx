import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import OrderStatusActions from "@/components/orderStatusActions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ITEMS_PER_PAGE = 5;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const userId = user.id;
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get total count for pagination
  const totalOrders = await prisma.order.count({
    where: { userId },
  });

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  // Fetch paginated orders
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: ITEMS_PER_PAGE,
  });

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'PICKUP':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  // Generate pagination numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/orders" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
              <p className="text-gray-600">
                Manage your laundry orders {totalOrders > 0 && `(${totalOrders} total)`}
              </p>
            </div>
            <Link
              href="/addOrder"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              + New Order
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Orders Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {totalOrders === 0 ? "No orders yet" : "No orders found"}
                </p>
                <Link
                  href="/addOrder"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first order
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Track ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
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
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                            >
                              {order.trackId}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative group">
                              <div className="text-sm font-medium text-gray-900 cursor-help">
                                {order.customerName}
                              </div>
                              {/* Tooltip */}
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                                <div className="mb-1">
                                  <span className="text-gray-400">Email:</span>
                                  <div className="break-all">{order.customerEmail}</div>
                                </div>
                                <div>
                                  <span className="text-gray-400">Phone:</span>
                                  <div>{order.customerNumber}</div>
                                </div>
                                {/* Arrow */}
                                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {order.status === 'PICKUP' || order.status === 'COMPLETE' ? (
                                order.price ? (
                                  `₱${order.price.toFixed(2)}`
                                ) : (
                                  <span className="text-gray-400">Not set</span>
                                )
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {formatStatus(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <OrderStatusActions order={order} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {skip + 1} to {Math.min(skip + ITEMS_PER_PAGE, totalOrders)} of {totalOrders} orders
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <Link
                        href={`/orders?page=${currentPage - 1}`}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </Link>

                      {/* Page Numbers */}
                      <div className="flex gap-1">
                        {getPageNumbers().map((page, idx) => 
                          page === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-3 py-1.5 text-gray-400">
                              ...
                            </span>
                          ) : (
                            <Link
                              key={page}
                              href={`/orders?page=${page}`}
                              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </Link>
                          )
                        )}
                      </div>

                      {/* Next Button */}
                      <Link
                        href={`/orders?page=${currentPage + 1}`}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}