// components/shopStatusToggle.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShopStatusToggle({
  initialStatus,
}: {
  initialStatus: boolean;
}) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    if (loading) return;

    const newStatus = !isAccepting;

    // Optimistic update
    setIsAccepting(newStatus);
    setLoading(true);

    try {
      const response = await fetch("/api/reservations/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          acceptingReservations: newStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update shop status");
      }

      const data = await response.json();
      
      // Update with server response
      setIsAccepting(data.acceptingReservations);
      
      // Refresh the page to update any UI that depends on this status
      router.refresh();

    } catch (error) {
      console.error("Error updating shop status:", error);
      alert(error instanceof Error ? error.message : "Failed to update shop status");
      
      // Revert optimistic update on error
      setIsAccepting(!newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-600">
        {isAccepting ? "Currently accepting reservations" : "Not accepting new reservations"}
      </div>
      <button
        onClick={toggleStatus}
        disabled={loading}
        className={`px-6 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm ${
          isAccepting
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
      >
        <span className={`inline-block w-2 h-2 rounded-full bg-white ${isAccepting ? 'animate-pulse' : ''}`}></span>
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          </span>
        ) : isAccepting ? (
          "Shop Open"
        ) : (
          "Shop Closed"
        )}
      </button>
    </div>
  );
}