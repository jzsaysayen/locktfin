"use client";

import dynamic from "next/dynamic";

const TurnaroundChart = dynamic(() => import("./turnaround"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center text-gray-500">
      Loading chart...
    </div>
  ),
});


interface TurnaroundWrapperProps {
  data: { date: string; avgHours: number }[];
}

export default function TurnaroundWrapper({ data }: TurnaroundWrapperProps) {
  return <TurnaroundChart data={data} />;
}
