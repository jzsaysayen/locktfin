"use client";

import dynamic from "next/dynamic";

const AnalyticsCharts = dynamic(() => import("./analytics"), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading charts...</div>,
});


interface AnalyticsWrapperProps {
  data: { date: string; RECEIVED: number; IN_PROGRESS: number; PICKUP: number; COMPLETE: number }[];
}

export default function AnalyticsWrapper({ data }: AnalyticsWrapperProps) {
  return <AnalyticsCharts data={data} />;
}
