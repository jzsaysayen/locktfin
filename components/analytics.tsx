"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AnalyticsChartProps {
  data: { date: string; RECEIVED: number; IN_PROGRESS: number; PICKUP: number; COMPLETE: number }[];
}

export default function AnalyticsCharts({ data }: AnalyticsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="RECEIVED" stroke="#3B82F6" />
        <Line type="monotone" dataKey="IN_PROGRESS" stroke="#F59E0B" />
        <Line type="monotone" dataKey="PICKUP" stroke="#10B981" />
        <Line type="monotone" dataKey="COMPLETE" stroke="#EF4444" />
      </LineChart>
    </ResponsiveContainer>
  );
}
