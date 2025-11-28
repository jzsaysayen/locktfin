// app/staff/reservations/page.tsx
import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import ReservationStatusActions from "@/components/reservationStatusActions";
import ShopStatusToggle from "@/components/shopStatusToggle";
import type { Prisma } from "../../../generated/prisma/client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ITEMS_PER_PAGE = 10;

export default async function StaffReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; tab?: string }>;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const searchQuery = params.search || '';
  const statusFilter = params.status || 'ALL';
  const activeTab = params.tab || 'pending'; // 'pending', 'confirmed', 'all'
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build where clause
  const whereClause: Prisma.ReservationWhereInput = {};

  // Add tab filter
  if (activeTab === 'pending') {
    whereClause.status = 'PENDING';
  } else if (activeTab === 'confirmed') {
    whereClause.status = 'CONFIRMED';
  } else if (statusFilter !== 'ALL') {
    whereClause.status = statusFilter as Prisma.ReservationWhereInput['status'];
  }

  // Add search filter
  if (searchQuery) {
    whereClause.OR = [
      { reservationId: { contains: searchQuery, mode: 'insensitive' } },
      { customerName: { contains: searchQuery, mode: 'insensitive' } },
      { customerEmail: { contains: searchQuery, mode: 'insensitive' } },
      { customerNumber: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  // Get total count for pagination
  const totalReservations = await prisma.reservation.count({
    where: whereClause,
  });

  const totalPages = Math.ceil(totalReservations / ITEMS_PER_PAGE);

  // Fetch paginated reservations
  const reservations = await prisma.reservation.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip,
    take: ITEMS_PER_PAGE,
  });

  // Get counts for tabs
  const pendingCount = await prisma.reservation.count({
    where: { status: 'PENDING' },
  });
  const confirmedCount = await prisma.reservation.count({
    where: { status: 'CONFIRMED' },
  });
  const completedCount = await prisma.reservation.count({
    where: { status: 'COMPLETED' },
  });
  const cancelledCount = await prisma.reservation.count({
    where: { status: 'CANCELLED' },
  });

  // FIXED: Get shop status from ShopSettings instead of UserSettings
  const shopSettings = await prisma.shopSettings.findUnique({
    where: { id: 'shop-settings' },
  });
  const acceptingReservations = shopSettings?.acceptingReservations ?? true;

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    
    return `/staff/reservations?${urlParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/staff/reservations" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Reservations</h1>
              <p className="text-gray-600">
                Manage customer laundry drop-off reservations
              </p>
            </div>
            <ShopStatusToggle initialStatus={acceptingReservations} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{cancelledCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <Link
              href={buildUrl({ tab: 'pending', page: '1', status: 'ALL' })}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending
              {pendingCount > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full text-xs">
                  {pendingCount}
                </span>
              )}
            </Link>
            <Link
              href={buildUrl({ tab: 'confirmed', page: '1', status: 'ALL' })}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'confirmed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Confirmed
              {confirmedCount > 0 && (
                <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                  {confirmedCount}
                </span>
              )}
            </Link>
            <Link
              href={buildUrl({ tab: 'all', page: '1' })}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Reservations
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          {/* Search Bar */}
          <form className="flex-1" action="/staff/reservations" method="get">
            <input type="hidden" name="tab" value={activeTab} />
            <input type="hidden" name="status" value={statusFilter} />
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search by reservation ID, customer name, email, or phone..."
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

          {/* Status Filter (only for all tab) */}
          {activeTab === 'all' && (
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                <Link
                  key={status}
                  href={buildUrl({ status, page: '1' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Reservations Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? "No reservations found matching your search" 
                    : activeTab === 'pending'
                    ? "No pending reservations"
                    : activeTab === 'confirmed'
                    ? "No confirmed reservations"
                    : "No reservations yet"}
                </p>
              </div>
            ) : (
              <>
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
                        {(activeTab === 'pending' || activeTab === 'confirmed') && (
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
                      {reservations.map((reservation) => (
                        <tr
                          key={reservation.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600">
                              {reservation.reservationId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative group">
                              <div className="text-sm font-medium text-gray-900 cursor-help">
                                {reservation.customerName}
                              </div>
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                                <div className="mb-1">
                                  <span className="text-gray-400">Email:</span>
                                  <div className="break-all">{reservation.customerEmail}</div>
                                </div>
                                <div>
                                  <span className="text-gray-400">Phone:</span>
                                  <div>{reservation.customerNumber}</div>
                                </div>
                                {reservation.specialInstructions && (
                                  <div className="mt-2 pt-2 border-t border-gray-700">
                                    <span className="text-gray-400">Special Instructions:</span>
                                    <div className="text-xs mt-1">{reservation.specialInstructions}</div>
                                  </div>
                                )}
                                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(reservation.dropoffDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {reservation.dropoffTime}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                reservation.status
                              )}`}
                            >
                              {reservation.status}
                            </span>
                          </td>
                          {(activeTab === 'pending' || activeTab === 'confirmed') && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ReservationStatusActions reservation={reservation} />
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(reservation.createdAt).toLocaleDateString('en-US', {
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
                      Showing {skip + 1} to {Math.min(skip + ITEMS_PER_PAGE, totalReservations)} of {totalReservations} reservations
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