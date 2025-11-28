// app/staff/dashboard/page.tsx
import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  format,
} from "date-fns";

// Client Wrappers for charts
import AnalyticsWrapper from "../../../components/analyticsWrapper";
import TurnaroundWrapper from "../../../components/turnaroundWrapper";
import TodaysPieChart from "../../../components/todaysPieChart";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user.id;

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  // Generate last 7 days upfront
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    return { date, formatted: format(date, "yyyy-MM-dd"), label: format(date, "MMM dd") };
  });

  // ============================================
  // RUN ALL QUERIES IN PARALLEL - MAJOR SPEEDUP
  // ============================================
  const [
    // Today's counts
    receivedToday,
    inProgressToday,
    pickupToday,
    completedToday,
    
    // Backlogs
    backlogsReceived,
    backlogsInProgress,
    backlogsPickup,
    
    // Completed week/month
    completedThisWeek,
    completedThisMonth,
    
    // Get ALL status history for last 7 days at once
    last7DaysHistory,
    
    // Get ALL completed orders for turnaround calculations
    completedOrders,

    // Reservation alerts
    pendingReservationsCount,
    todayReservationsCount,
    shopSettings,
  ] = await Promise.all([
    // Today's Statuses
    prisma.orderStatusHistory.count({
      where: { status: "RECEIVED", timestamp: { gte: todayStart, lte: todayEnd }, order: { userId } },
    }),
    prisma.orderStatusHistory.count({
      where: { status: "IN_PROGRESS", timestamp: { gte: todayStart, lte: todayEnd }, order: { userId } },
    }),
    prisma.orderStatusHistory.count({
      where: { status: "PICKUP", timestamp: { gte: todayStart, lte: todayEnd }, order: { userId } },
    }),
    prisma.orderStatusHistory.count({
      where: { status: "COMPLETE", timestamp: { gte: todayStart, lte: todayEnd }, order: { userId } },
    }),

    // Backlogs
    prisma.order.count({
      where: { userId, status: "RECEIVED", createdAt: { lt: todayStart } },
    }),
    prisma.order.count({
      where: { userId, status: "IN_PROGRESS", updatedAt: { lt: todayStart } },
    }),
    prisma.order.count({
      where: { userId, status: "PICKUP", updatedAt: { lt: todayStart } },
    }),

    // Completed this week & month
    prisma.order.count({
      where: { userId, status: "COMPLETE", updatedAt: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.order.count({
      where: { userId, status: "COMPLETE", updatedAt: { gte: monthStart, lte: monthEnd } },
    }),

    // Get ALL status history for the last 7 days in ONE query
    prisma.orderStatusHistory.findMany({
      where: {
        timestamp: { gte: startOfDay(last7Days[0].date), lte: endOfDay(last7Days[6].date) },
        order: { userId },
      },
      select: { status: true, timestamp: true },
    }),

    // Get ALL completed orders in ONE query
    prisma.order.findMany({
      where: { userId, status: "COMPLETE" },
      select: { createdAt: true, updatedAt: true },
    }),

    // Reservation alerts
    prisma.reservation.count({
      where: { status: 'PENDING' },
    }),
    prisma.reservation.count({
      where: {
        dropoffDate: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
    prisma.shopSettings.findUnique({
      where: { id: 'shop-settings' },
    }),
  ]);

  const acceptingReservations = shopSettings?.acceptingReservations ?? true;

  // ============================================
  // PROCESS ANALYTICS DATA (in memory, not DB)
  // ============================================
  const analyticsData = last7Days.map(({ date, label }) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Filter in JavaScript instead of making DB queries
    const dayHistory = last7DaysHistory.filter(
      h => h.timestamp >= dayStart && h.timestamp <= dayEnd
    );

    return {
      date: label,
      RECEIVED: dayHistory.filter(h => h.status === "RECEIVED").length,
      IN_PROGRESS: dayHistory.filter(h => h.status === "IN_PROGRESS").length,
      PICKUP: dayHistory.filter(h => h.status === "PICKUP").length,
      COMPLETE: dayHistory.filter(h => h.status === "COMPLETE").length,
    };
  });

  // ============================================
  // CALCULATE TURNAROUND DATA (in memory)
  // ============================================
  const avgTurnaround =
    completedOrders.length > 0
      ? completedOrders.reduce(
          (sum, o) => sum + (o.updatedAt.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60),
          0
        ) / completedOrders.length
      : 0;

  const avgTurnaroundData = last7Days.map(({ date, label }) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dayCompleted = completedOrders.filter(
      o => o.updatedAt >= dayStart && o.updatedAt <= dayEnd
    );

    const avg =
      dayCompleted.length > 0
        ? dayCompleted.reduce(
            (sum, o) => sum + (o.updatedAt.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60),
            0
          ) / dayCompleted.length
        : 0;

    return { date: label, avgHours: avg };
  });

  // Format turnaround time for better readability
  const formatTurnaroundTime = (hours: number) => {
    if (hours === 0) return "No data available";
    
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    const minutes = Math.floor((hours % 1) * 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (remainingHours > 0) parts.push(`${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0 && days === 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    
    return parts.join(', ') || 'Less than a minute';
  };

  // Today's data for pie chart
  const todaysData = [
    { name: 'Received', value: receivedToday, color: '#3B82F6' },
    { name: 'In Progress', value: inProgressToday, color: '#F59E0B' },
    { name: 'Pickup', value: pickupToday, color: '#8B5CF6' },
    { name: 'Completed', value: completedToday, color: '#10B981' },
  ];

  const totalTodayOrders = receivedToday + inProgressToday + pickupToday + completedToday;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/staff/dashboard" />
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your laundry business today.</p>
        </div>

        {/* Important Alerts Section */}
        {(pendingReservationsCount > 0 || todayReservationsCount > 0 || !acceptingReservations) && (
          <div className="mb-8 space-y-3">
            {/* Pending Reservations Alert */}
            {pendingReservationsCount > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        {pendingReservationsCount} pending reservation{pendingReservationsCount > 1 ? 's' : ''} awaiting confirmation
                      </p>
                      <p className="text-xs text-yellow-700 mt-0.5">
                        Review and confirm customer reservations to ensure smooth operations
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/staff/reservations?tab=pending"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors whitespace-nowrap ml-4"
                  >
                    Review Now
                  </Link>
                </div>
              </div>
            )}

            {/* Today's Reservations */}
            {todayReservationsCount > 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        {todayReservationsCount} customer{todayReservationsCount > 1 ? 's' : ''} scheduled to drop off today
                      </p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Be prepared for incoming laundry orders
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/staff/reservations"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
                  >
                    View Schedule
                  </Link>
                </div>
              </div>
            )}

            {/* Shop Closed Notice */}
            {!acceptingReservations && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Your shop is currently NOT accepting reservations
                      </p>
                      <p className="text-xs text-red-700 mt-0.5">
                        Customers cannot book new drop-off appointments
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/staff/reservations"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap ml-4"
                  >
                    Manage Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Today's Overview - Cards + Pie Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today&apos;s Activity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Order Distribution</h3>
              <TodaysPieChart data={todaysData} total={totalTodayOrders} />
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Received Today</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{receivedToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-sm border border-amber-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600">In Progress Today</p>
                    <p className="text-3xl font-bold text-amber-900 mt-2">{inProgressToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Ready for Pickup</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">{pickupToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Completed Today</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">{completedToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backlogs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Orders</h2>
            <span className="text-sm text-gray-500">Orders waiting from previous days</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Received Backlog</p>
                {backlogsReceived > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Needs attention
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">{backlogsReceived}</p>
              <p className="text-xs text-gray-500 mt-1">Orders waiting to be processed</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">In Progress Backlog</p>
                {backlogsInProgress > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    In process
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">{backlogsInProgress}</p>
              <p className="text-xs text-gray-500 mt-1">Orders currently being cleaned</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Pickup Backlog</p>
                {backlogsPickup > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Ready
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">{backlogsPickup}</p>
              <p className="text-xs text-gray-500 mt-1">Orders ready for customer pickup</p>
            </div>
          </div>
        </div>

        {/* Completed Week/Month */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Orders</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow-sm border border-emerald-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">This Week</p>
                  <p className="text-4xl font-bold text-emerald-900 mt-2">{completedThisWeek}</p>
                  <p className="text-xs text-emerald-600 mt-1">Total orders completed</p>
                </div>
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600">This Month</p>
                  <p className="text-4xl font-bold text-teal-900 mt-2">{completedThisMonth}</p>
                  <p className="text-xs text-teal-600 mt-1">Total orders completed</p>
                </div>
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics: Last 7 Days Orders */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7-Day Order Trends</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-4">Track how your orders flow through different stages over the past week</p>
            <AnalyticsWrapper data={analyticsData} />
          </div>
        </div>

        {/* Average Turnaround */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Speed</h2>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-sm border border-indigo-200 p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600 mb-2">Average Turnaround Time</p>
                <p className="text-4xl font-bold text-indigo-900 mb-3">{formatTurnaroundTime(avgTurnaround)}</p>
                <div className="bg-white/60 rounded-lg p-4 max-w-xl">
                  <p className="text-sm text-indigo-900">
                    <span className="font-semibold">What this means:</span> This is the average time it takes for an order to go from &quot;Received&quot; to &quot;Complete&quot;. 
                    {avgTurnaround > 0 && (
                      <span className="block mt-2">
                        {avgTurnaround < 24 
                          ? "Great job! You're completing orders within a day." 
                          : avgTurnaround < 48 
                          ? "You're completing orders in about 1-2 days." 
                          : "Consider ways to speed up your process for faster customer service."}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Average Turnaround Trend */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Turnaround Time Trend</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-4">See how your service speed changes day by day. Lower is better!</p>
            <TurnaroundWrapper data={avgTurnaroundData} />
          </div>
        </div>
      </main>
    </div>
  );
}