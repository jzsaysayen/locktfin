import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import BlacklistForm from "@/components/blacklistForm";
import BlacklistRow from "@/components/blacklistRow";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlacklistPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const entries = await prisma.blacklistEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/staff/blacklist" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Blacklist Management
          </h1>
          <p className="text-gray-600">
            Block or unblock specific emails, phone numbers, or IP addresses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add entry form */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add to blacklist
            </h2>
            <BlacklistForm />
          </div>

          {/* List of entries */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Existing entries
              </h2>
              <p className="text-sm text-gray-500">
                Showing latest {entries.length} entries
              </p>
            </div>
            <div className="divide-y divide-gray-200 max-h-[540px] overflow-y-auto">
              {entries.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No blacklist entries yet.
                </div>
              ) : (
                entries.map((entry) => (
                  <BlacklistRow key={entry.id} entry={entry} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}