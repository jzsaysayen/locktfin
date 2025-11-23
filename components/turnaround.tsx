"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TurnaroundChartProps {
  data: { date: string; avgHours: number }[];
}

export default function TurnaroundChart({ data }: TurnaroundChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Line type="monotone" dataKey="avgHours" stroke="#6366F1" />
      </LineChart>
    </ResponsiveContainer>
  );
}
