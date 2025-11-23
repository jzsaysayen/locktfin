import Link from "next/link";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const user = await stackServerApp.getUser();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-10 to-blue-100 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            LaundryLink
          </h1>
          <h2 className="text-4xl font-extrabold text-blue-600 mb-6">
            Your laundry, simplified.
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Streamline your laundry business with LaundryLink - the all-in-one
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/track"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-200 transition-colors"
            >
              Track Order
            </Link>
          </div>
          <div className="flex flex-col py-10 space-x-0 space-y-10 md:space-y-0 md:space-x-5 md:flex-row">
            <div className="flex flex-col items-center justify-start px-5 space-y-3 md:w-1/3">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-600 rounded-full">
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Data-Driven Management</h3>
              <p className="text-center text-gray-600">
                Monitor essential metrics such as daily revenue, shop traffic, and a five-day predictive revenue forecast to support proactive decision-making and data-driven business planning.
              </p>
            </div>
            <div className="flex flex-col items-center justify-start px-5 space-y-3 md:w-1/3">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-600 rounded-full">
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Streamlined Productivity</h3>
              <p className="text-center text-gray-600">
                Utilize our intuitive management system to keep your staff productive and allow customers to handle their own tracking, reducing manual effort and errors.
              </p>
            </div>
            <div className="flex flex-col items-center justify-start px-5 space-y-3 md:w-1/3">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-600 rounded-full">
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Total Operational Control</h3>
              <p className="text-center text-gray-600">
                Take full control of your entire laundry operation with a single platform designed to centralize and optimize every aspect of your business.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}