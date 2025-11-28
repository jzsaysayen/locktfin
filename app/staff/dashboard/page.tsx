import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
  ]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/staff/dashboard" />
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p>Welcome back! Overview of your Laundry Management System.</p>
        </div>

        {/* Today's Statuses */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-sm text-gray-500">Received Today</h2>
            <p className="text-xl font-bold">{receivedToday}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-sm text-gray-500">In Progress Today</h2>
            <p className="text-xl font-bold">{inProgressToday}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-sm text-gray-500">Pickup Today</h2>
            <p className="text-xl font-bold">{pickupToday}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-sm text-gray-500">Completed Today</h2>
            <p className="text-xl font-bold">{completedToday}</p>
          </div>
        </div>

        {/* Backlogs */}
        <h2 className="text-lg font-bold mb-4">Backlogs</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-yellow-50 rounded shadow">
            <h2 className="text-sm text-gray-500">Received Backlog</h2>
            <p className="text-xl font-bold">{backlogsReceived}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded shadow">
            <h2 className="text-sm text-gray-500">In Progress Backlog</h2>
            <p className="text-xl font-bold">{backlogsInProgress}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded shadow">
            <h2 className="text-sm text-gray-500">Pickup Backlog</h2>
            <p className="text-xl font-bold">{backlogsPickup}</p>
          </div>
        </div>

        {/* Completed Week/Month */}
        <h2 className="text-lg font-bold mb-4">Completed</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-green-50 rounded shadow">
            <h2 className="text-sm text-gray-500">This Week</h2>
            <p className="text-xl font-bold">{completedThisWeek}</p>
          </div>
          <div className="p-4 bg-green-50 rounded shadow">
            <h2 className="text-sm text-gray-500">This Month</h2>
            <p className="text-xl font-bold">{completedThisMonth}</p>
          </div>
        </div>

        {/* Analytics: Last 7 Days Orders */}
        <h2 className="text-lg font-bold mb-4">Last 7 Days Orders</h2>
        <div className="p-4 bg-white rounded shadow mb-8">
          <AnalyticsWrapper data={analyticsData} />
        </div>

        {/* Average Turnaround */}
        <h2 className="text-lg font-bold mb-4">Average Turnaround Time</h2>
        <div className="p-4 bg-white rounded shadow mb-8">
          <p className="text-xl">{avgTurnaround.toFixed(2)} hours (RECEIVED → COMPLETE)</p>
        </div>

        {/* Average Turnaround Trend */}
        <h2 className="text-lg font-bold mb-4">Average Turnaround Trend (Last 7 Days)</h2>
        <div className="p-4 bg-white rounded shadow mb-8">
          <TurnaroundWrapper data={avgTurnaroundData} />
        </div>
      </main>
    </div>
  );
}