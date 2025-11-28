'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: string;
  reservationId: string;
  status: string;
  customerName: string;
}

interface ReservationStatusActionsProps {
  reservation: Reservation;
}

export default function ReservationStatusActions({ reservation }: ReservationStatusActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (isLoading) return;

    const confirmMessages: Record<string, string> = {
      CONFIRMED: `Confirm reservation ${reservation.reservationId} for ${reservation.customerName}?`,
      CANCELLED: `Cancel reservation ${reservation.reservationId}? This action cannot be undone.`,
      COMPLETED: `Mark as received and create order for ${reservation.customerName}?`,
    };

    if (!window.confirm(confirmMessages[newStatus])) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/reservations/${reservation.reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const data = await response.json();

      // If completing (creating order), redirect to orders page
      if (newStatus === 'COMPLETED' && data.order) {
        router.push(`/staff/orders?tab=active&highlight=${data.order.trackId}`);
        return;
      }

      // Otherwise, refresh the page to show updated data
      router.refresh();

    } catch (error) {
      console.error('Error updating reservation status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  if (reservation.status === 'PENDING') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleStatusUpdate('CONFIRMED')}
          disabled={isLoading}
          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Confirm'}
        </button>
        <button
          onClick={() => handleStatusUpdate('CANCELLED')}
          disabled={isLoading}
          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (reservation.status === 'CONFIRMED') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleStatusUpdate('COMPLETED')}
          disabled={isLoading}
          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Mark as Received'}
        </button>
        <button
          onClick={() => handleStatusUpdate('CANCELLED')}
          disabled={isLoading}
          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    );
  }

  return null;
}