'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EmailSettingsFormProps {
  settings: {
    id: string;
    resendApiKey: string | null;
    emailFromAddress: string | null;
    pickupEmailSubject: string;
    pickupEmailMessage: string;
  };
}

export default function EmailSettingsForm({ settings }: EmailSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    resendApiKey: settings.resendApiKey || '',
    emailFromAddress: settings.emailFromAddress || '',
    pickupEmailSubject: settings.pickupEmailSubject,
    pickupEmailMessage: settings.pickupEmailMessage,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccess(true);
      router.refresh();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      pickupEmailSubject: 'Your laundry is ready for pickup - Order {trackId}',
      pickupEmailMessage: `Hi {customerName},

Great news! Your laundry order is now ready for pickup.

Order Details:
• Tracking ID: {trackId}
• Total Amount: ₱{price}

Please bring your tracking ID when picking up your order.

You can track your order anytime at: {trackUrl}

Thank you for choosing LaundryLink!`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Settings saved successfully! ✓</span>
        </div>
      )}

      {/* Resend API Key */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resend API Key
        </label>
        <input
          type="password"
          value={formData.resendApiKey}
          onChange={(e) => setFormData({ ...formData, resendApiKey: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="re_..."
        />
        <p className="text-sm text-gray-500 mt-1">
          Your Resend API key for sending emails
        </p>
      </div>

      {/* Email From Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          From Email Address
        </label>
        <input
          type="email"
          value={formData.emailFromAddress}
          onChange={(e) => setFormData({ ...formData, emailFromAddress: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="onboarding@resend.dev"
        />
        <p className="text-sm text-gray-500 mt-1">
          Email address that will appear as sender (use onboarding@resend.dev for testing)
        </p>
      </div>

      {/* Pickup Notification Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pickup Notification Subject
        </label>
        <input
          type="text"
          value={formData.pickupEmailSubject}
          onChange={(e) => setFormData({ ...formData, pickupEmailSubject: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Pickup Notification Message */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Pickup Notification Message
          </label>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Reset to Default
          </button>
        </div>
        <textarea
          value={formData.pickupEmailMessage}
          onChange={(e) => setFormData({ ...formData, pickupEmailMessage: e.target.value })}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
        <p className="text-sm text-gray-500 mt-1">
          Customize the email message sent when an order is ready for pickup
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Settings
            </>
          )}
        </button>
        
        {success && (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Saved!
          </div>
        )}
      </div>
    </form>
  );
}