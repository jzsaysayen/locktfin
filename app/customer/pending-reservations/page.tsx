"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Reservation {
  id: string;
  reservationId: string;
  customerName: string;
  customerNumber: string;
  customerEmail: string;
  dropoffDate: string;
  dropoffTime: string;
  specialInstructions: string | null;
  status: string;
  createdAt: string;
}

export default function PendingReservationsPage() {
  const searchParams = useSearchParams();
  const prefilledId = searchParams.get("id");
  
  const [searchType, setSearchType] = useState<"id" | "email">("id");
  const [searchValue, setSearchValue] = useState(prefilledId || "");
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [shopStatus, setShopStatus] = useState<{
    acceptingReservations: boolean;
    pendingCount: number;
  } | null>(null);

  // Fetch shop status and pending count
  useEffect(() => {
    async function fetchShopStatus() {
      try {
        const response = await fetch('/api/reservations/status');
        const data = await response.json();
        
        // Get pending count
        const statsResponse = await fetch('/api/reservations/stats');
        const statsData = await statsResponse.json();
        
        setShopStatus({
          acceptingReservations: data.acceptingReservations,
          pendingCount: statsData.pendingCount || 0,
        });
      } catch (error) {
        console.error('Error fetching shop status:', error);
      }
    }
    
    fetchShopStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchShopStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchValue.trim()) {
      setErrorMessage("Please enter a search value");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setReservations([]);

    try {
      const params = new URLSearchParams();
      if (searchType === "id") {
        params.append("reservationId", searchValue.trim());
      } else {
        params.append("email", searchValue.trim());
      }

      const response = await fetch(`/api/reservations?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch reservations");
      }

      // Handle both single reservation and array of reservations
      if (data.reservation) {
        setReservations([data.reservation]);
      } else if (data.reservations) {
        if (data.reservations.length === 0) {
          setErrorMessage("No pending reservations found");
        } else {
          setReservations(data.reservations);
        }
      }

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [searchValue, searchType]);

  // Auto-search if ID is provided in URL
  useEffect(() => {
    if (prefilledId) {
      handleSearch();
    }
  }, [prefilledId, handleSearch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            North End Laundry
          </Link>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Shop Status Banner */}
        {shopStatus && (
          <div className={`mb-6 rounded-lg p-4 ${
            shopStatus.acceptingReservations 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  shopStatus.acceptingReservations ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className={`font-semibold ${
                    shopStatus.acceptingReservations ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {shopStatus.acceptingReservations ? 'Now Accepting Reservations' : 'Not Accepting Reservations'}
                  </p>
                  <p className={`text-sm ${
                    shopStatus.acceptingReservations ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {shopStatus.pendingCount} {shopStatus.pendingCount === 1 ? 'reservation' : 'reservations'} pending
                  </p>
                </div>
              </div>
              {shopStatus.acceptingReservations && (
                <Link
                  href="/reservation"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Make Reservation
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Check Your Reservations
          </h1>
          <p className="text-gray-600 mb-6">
            View your pending laundry drop-off reservations
          </p>

          {/* Search Form */}
          <div className="mb-8">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setSearchType("id")}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  searchType === "id"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Search by ID
              </button>
              <button
                onClick={() => setSearchType("email")}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  searchType === "email"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Search by Email
              </button>
            </div>

            <div className="flex gap-4">
              <input
                type={searchType === "email" ? "email" : "text"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={
                  searchType === "id"
                    ? "Enter Reservation ID (e.g., RES-ABC123)"
                    : "Enter your email address"
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{errorMessage}</p>
            </div>
          )}

          {/* Reservations List */}
          {reservations.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                {reservations.length === 1
                  ? "Your Reservation"
                  : `Your Reservations (${reservations.length})`}
              </h2>

              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {reservation.reservationId}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created on{" "}
                        {new Date(reservation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Customer Name
                      </p>
                      <p className="text-gray-900">{reservation.customerName}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Phone Number
                      </p>
                      <p className="text-gray-900">{reservation.customerNumber}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Drop-off Date
                      </p>
                      <p className="text-gray-900">
                        {formatDate(reservation.dropoffDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Drop-off Time
                      </p>
                      <p className="text-gray-900">{reservation.dropoffTime}</p>
                    </div>
                  </div>

                  {reservation.specialInstructions && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Special Instructions
                      </p>
                      <p className="text-gray-900">
                        {reservation.specialInstructions}
                      </p>
                    </div>
                  )}

                  {reservation.status === "PENDING" && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Your reservation is pending confirmation. 
                        Please bring your laundry at the scheduled time.
                      </p>
                    </div>
                  )}

                  {reservation.status === "CONFIRMED" && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Confirmed!</strong> We`re expecting you at the scheduled time.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && reservations.length === 0 && !errorMessage && (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-600">
                Enter your reservation ID or email to view your reservations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}