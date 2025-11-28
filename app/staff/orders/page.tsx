import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import OrderStatusActions from "@/components/orderStatusActions";
import type { Prisma } from "../../../generated/prisma/client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ITEMS_PER_PAGE = 5;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; tab?: string }>;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/staff/login');
  }

  const userId = user.id;
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const searchQuery = params.search || '';
  const statusFilter = params.status || 'ALL';
  const activeTab = params.tab || 'active'; // 'active' or 'completed'
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build where clause
  const whereClause: Prisma.OrderWhereInput = {
    userId,
    ...(activeTab === 'active' 
      ? { status: { not: 'COMPLETE' } }
      : { status: 'COMPLETE' }
    ),
  };

  // Add status filter (only for active tab)
  if (activeTab === 'active' && statusFilter !== 'ALL') {
    whereClause.status = statusFilter as Prisma.OrderWhereInput['status'];
  }

  // Add search filter
  if (searchQuery) {
    whereClause.OR = [
      { trackId: { contains: searchQuery, mode: 'insensitive' } },
      { customerName: { contains: searchQuery, mode: 'insensitive' } },
      { customerEmail: { contains: searchQuery, mode: 'insensitive' } },
      { customerNumber: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  // Get total count for pagination
  const totalOrders = await prisma.order.count({
    where: whereClause,
  });

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  // Fetch paginated orders
  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip,
    take: ITEMS_PER_PAGE,
  });

  // Get counts for tabs
  const activeCount = await prisma.order.count({
    where: { userId, status: { not: 'COMPLETE' } },
  });
  const completedCount = await prisma.order.count({
    where: { userId, status: 'COMPLETE' },
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

  // Build URL helper
  const buildUrl = (updates: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();
    const newParams = { tab: activeTab, status: statusFilter, search: searchQuery, ...updates };
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== 'ALL') {
        urlParams.set(key, value);
      }
    });
    
    return `/staff/orders?${urlParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/staff/orders" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
              <p className="text-gray-600">
                Manage your laundry orders
              </p>
            </div>
            <Link
              href="/staff/addOrder"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              + New Order
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <Link
              href={buildUrl({ tab: 'active', page: '1', status: 'ALL' })}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'active'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Orders
              {activeCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                  {activeCount}
                </span>
              )}
            </Link>
            <Link
              href={buildUrl({ tab: 'completed', page: '1' })}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'completed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed Orders
              {completedCount > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {completedCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          {/* Search Bar */}
          <form className="flex-1" action="/staff/orders" method="get">
            <input type="hidden" name="tab" value={activeTab} />
            <input type="hidden" name="status" value={statusFilter} />
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search by track ID, customer name, email, or phone..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Status Filter (only for active tab) */}
          {activeTab === 'active' && (
            <div className="flex gap-2">
              {['ALL', 'RECEIVED', 'IN_PROGRESS', 'PICKUP'].map((status) => (
                <Link
                  key={status}
                  href={buildUrl({ status, page: '1' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status === 'ALL' ? 'All' : formatStatus(status)}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Orders Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? "No orders found matching your search" 
                    : activeTab === 'completed'
                    ? "No completed orders yet"
                    : "No active orders"}
                </p>
                {!searchQuery && activeTab === 'active' && (
                  <Link
                    href="/staff/addOrder"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create your first order
                  </Link>
                )}
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
                        {activeTab === 'active' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
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
                              href={`/track/${order.trackId}`}
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
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                                <div className="mb-1">
                                  <span className="text-gray-400">Email:</span>
                                  <div className="break-all">{order.customerEmail}</div>
                                </div>
                                <div>
                                  <span className="text-gray-400">Phone:</span>
                                  <div>{order.customerNumber}</div>
                                </div>
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
                          {activeTab === 'active' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <OrderStatusActions order={order} />
                            </td>
                          )}
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
                      <Link
                        href={buildUrl({ page: String(currentPage - 1) })}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </Link>

                      <div className="flex gap-1">
                        {getPageNumbers().map((page, idx) => 
                          page === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-3 py-1.5 text-gray-400">
                              ...
                            </span>
                          ) : (
                            <Link
                              key={page}
                              href={buildUrl({ page: String(page) })}
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

                      <Link
                        href={buildUrl({ page: String(currentPage + 1) })}
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