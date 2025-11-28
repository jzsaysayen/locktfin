'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type OrderStatus = 'RECEIVED' | 'IN_PROGRESS' | 'PICKUP' | 'COMPLETE';

export default function AddOrderForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerNumber: '',
    customerEmail: '',
    notes: '',
    status: 'RECEIVED' as OrderStatus,
    sendEmail: true, // Default to true - always send confirmation
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerNumber: formData.customerNumber,
          customerEmail: formData.customerEmail,
          price: 0, // Initial price is 0
          notes: formData.notes || null,
          status: 'RECEIVED', // Always RECEIVED initially
          sendEmail: formData.sendEmail,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setSuccess(true);
      
      // Reset form
      setFormData({
        customerName: '',
        customerNumber: '',
        customerEmail: '',
        notes: '',
        status: 'RECEIVED',
        sendEmail: true,
      });

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        router.push('/staff/orders');
      }, 2000);
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          Order created successfully! Redirecting to orders page...
        </div>
      )}

      {/* Customer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Juan Dela Cruz"
        />
      </div>

      {/* Customer Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          required
          value={formData.customerNumber}
          onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="09123456789"
        />
      </div>

      {/* Customer Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={formData.customerEmail}
          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="customer@example.com"
        />
        <p className="text-sm text-gray-500 mt-1">
          Email notifications will be sent to this address
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Special instructions or notes..."
        />
      </div>

      {/* Send Email Checkbox */}
      <div className="flex items-start bg-blue-50 border border-blue-200 rounded-lg p-4">
        <input
          type="checkbox"
          id="sendEmail"
          checked={formData.sendEmail}
          onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="sendEmail" className="ml-3 block text-sm text-gray-700">
          <span className="font-medium">Send email notification to customer</span>
          <span className="block text-xs text-gray-600 mt-1">
            ✉️ Sends order confirmation with QR code for tracking
          </span>
          <span className="block text-xs text-gray-500 mt-1">
            Note: Price will be notified when order status is updated to `Ready for Pickup`
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Order...' : 'Create Order'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/staff/orders')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}