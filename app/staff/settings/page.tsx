import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EmailSettingsForm from "@/components/emailSettingsForm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user settings (create if doesn't exist)
  let settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  // Create default settings if none exist
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId: user.id,
        resendApiKey: '',
        emailFromAddress: '',
        pickupEmailSubject: 'Your laundry is ready for pickup - Order {trackId}',
        pickupEmailMessage: `Hi {customerName},

Great news! Your laundry order is now ready for pickup.

Order Details:
• Tracking ID: {trackId}
• Total Amount: ₱{price}

Please bring your tracking ID when picking up your order.

You can track your order anytime at: {trackUrl}

Thank you for choosing LaundryLink!`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/staff/settings" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your LaundryLink preferences</p>
        </div>

        <div className="max-w-4xl">
          {/* Email Settings Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure email settings for customer notifications
              </p>
            </div>
            
            <div className="p-6">
              <EmailSettingsForm settings={settings} />
            </div>
          </div>

          {/* Available Variables Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              📝 Available Variables
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Use these variables in your email subject and message. They will be automatically replaced:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-blue-900">
                <code className="bg-blue-100 px-2 py-0.5 rounded">{"{customerName}"}</code>
                <span className="text-blue-700 ml-2">Customer`s name</span>
              </div>
              <div className="text-blue-900">
                <code className="bg-blue-100 px-2 py-0.5 rounded">{"{trackId}"}</code>
                <span className="text-blue-700 ml-2">Order tracking ID</span>
              </div>
              <div className="text-blue-900">
                <code className="bg-blue-100 px-2 py-0.5 rounded">{"{price}"}</code>
                <span className="text-blue-700 ml-2">Order price</span>
              </div>
              <div className="text-blue-900">
                <code className="bg-blue-100 px-2 py-0.5 rounded">{"{trackUrl}"}</code>
                <span className="text-blue-700 ml-2">Order tracking URL</span>
              </div>
            </div>
          </div>

          {/* Resend Setup Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              🚀 How to get your Resend API Key
            </h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Sign up for a free account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">resend.com</a></li>
              <li>Verify your email address</li>
              <li>Go to API Keys section in your dashboard</li>
              <li>Create a new API key and copy it</li>
              <li>Paste it in the field above</li>
              <li>Free tier includes 3,000 emails per month</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}