import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddOrderForm from "@/components/addOrderForm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AddOrderPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/staff/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/staff/addOrder" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Order</h1>
          <p className="text-gray-600">Create a new laundry order</p>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <AddOrderForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}