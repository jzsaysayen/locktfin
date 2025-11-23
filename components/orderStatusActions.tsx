"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Order = {
  id: string;
  status: string;
  customerEmail: string;
  customerName: string;
  trackId: string;
  price: number;
};

export default function OrderStatusActions({ order }: { order: Order }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  // Determine next status
  const getNextStatus = () => {
    switch (order.status) {
      case "RECEIVED":
        return "IN_PROGRESS";
      case "IN_PROGRESS":
        return "PICKUP";
      case "PICKUP":
        return "COMPLETE";
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    // If moving to PICKUP, show price modal
    if (newStatus === "PICKUP") {
      setShowPriceModal(true);
      return;
    }

    // Otherwise, proceed with status change
    await updateStatus(newStatus);
  };

  // Update status with optional price
  const updateStatus = async (newStatus: string, priceValue?: number) => {
    setIsLoading(true);
    setError("");

    // Create loading toast
    const loadingToast = toast.loading(
      newStatus === "PICKUP" 
        ? "Updating status and sending notification..." 
        : "Updating order status..."
    );

    try {
      const response = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
          price: priceValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success message based on status
      if (newStatus === "PICKUP") {
        if (data.emailError) {
          toast.error("Status updated, but email notification failed", {
            duration: 5000,
          });
        } else {
          toast.success(`🎉 Order ready! Email sent to ${order.customerName}`, {
            duration: 4000,
          });
        }
      } else if (newStatus === "IN_PROGRESS") {
        toast.success("Order is now being processed");
      } else if (newStatus === "COMPLETE") {
        toast.success("Order marked as complete! 🎊");
      } else {
        toast.success("Order status updated successfully");
      }

      // Close modal and refresh
      setShowPriceModal(false);
      setPrice("");
      router.refresh();
    } catch (err) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      const errorMessage = err instanceof Error ? err.message : "Failed to update status";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle price submission
  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError("Please enter a valid price");
      toast.error("Please enter a valid price");
      return;
    }

    await updateStatus("PICKUP", priceValue);
  };

  // Format button text
  const getButtonText = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "Start Processing";
      case "PICKUP":
        return "Ready for Pickup";
      case "COMPLETE":
        return "Mark Complete";
      default:
        return "Update";
    }
  };

  if (!nextStatus || order.status === "COMPLETE") {
    return (
      <span className="text-xs text-gray-400">
        {order.status === "COMPLETE" ? "Completed" : "—"}
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => handleStatusChange(nextStatus)}
        disabled={isLoading}
        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Updating..." : getButtonText(nextStatus)}
      </button>

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Set Order Price</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-1">
                Order for: <span className="font-medium text-gray-900">{order.customerName}</span>
              </p>
              <p className="text-sm text-gray-600">
                Track ID: <span className="font-medium text-gray-900">{order.trackId}</span>
              </p>
            </div>

            <form onSubmit={handlePriceSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₱)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter price"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex gap-2">
                  <span className="text-blue-600 flex-shrink-0">📧</span>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-blue-800 leading-relaxed break-words">
                      An email will be sent to <span className="font-medium break-all">{order.customerEmail}</span> notifying them that their order is ready for pickup.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriceModal(false);
                    setPrice("");
                    setError("");
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Set Price & Notify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}