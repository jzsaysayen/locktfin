"use client";

import React from "react";

interface BlacklistRowProps {
  entry: {
    id: string;
    type: "EMAIL" | "PHONE" | "IP";
    value: string;
    reason: string | null;
    active: boolean;
    createdBy: string | null;
    createdAt: Date;
  };
}

export default function BlacklistRow({ entry }: BlacklistRowProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [active, setActive] = React.useState(entry.active);

  const toggleActive = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/blacklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, active: !active }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update entry");
        return;
      }
      setActive(!active);
    } catch (err) {
      console.error("Error updating blacklist entry:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const typeLabel =
    entry.type === "EMAIL" ? "Email" : entry.type === "PHONE" ? "Phone" : "IP";

  return (
    <div className="px-6 py-4 flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase text-gray-500">
            {typeLabel}
          </span>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
              active
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="mt-1 text-sm font-mono text-gray-900 break-all">
          {entry.value}
        </div>
        {entry.reason && (
          <div className="mt-1 text-xs text-gray-600">
            Reason: {entry.reason}
          </div>
        )}
        <div className="mt-1 text-xs text-gray-400">
          Added{" "}
          {new Date(entry.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={toggleActive}
        disabled={isUpdating}
        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
          active
            ? "border-gray-300 text-gray-700 hover:bg-gray-50"
            : "border-red-500 text-red-600 hover:bg-red-50"
        } ${isUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {isUpdating ? "Saving..." : active ? "Deactivate" : "Reactivate"}
      </button>
    </div>
  );
}