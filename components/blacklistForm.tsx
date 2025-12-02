"use client";

import React from "react";

export default function BlacklistForm() {
  const [type, setType] = React.useState<"EMAIL" | "PHONE" | "IP">("EMAIL");
  const [value, setValue] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: value.trim(), reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to add blacklist entry");
        return;
      }
      setValue("");
      setReason("");
      // Simple way to refresh server component data
      window.location.reload();
    } catch (err) {
      console.error("Error adding blacklist entry:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value as "EMAIL" | "PHONE" | "IP")
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="EMAIL">Email</option>
          <option value="PHONE">Phone</option>
          <option value="IP">IP address</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Value
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            type === "EMAIL"
              ? "user@example.com"
              : type === "PHONE"
              ? "+639123456789"
              : "203.0.113.42"
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason (optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Why is this being blacklisted?"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2 px-4 rounded-lg text-sm font-medium text-white transition-colors ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {isSubmitting ? "Adding..." : "Add to blacklist"}
      </button>

      <p className="text-xs text-gray-500">
        Tip: Use this to quickly block abusive customers or undo accidental
        blacklisting later.
      </p>
    </form>
  );
}