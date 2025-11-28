// components/sidebar.tsx
'use client';

import { UserButton } from "@stackframe/stack";
import { BarChart3, Bubbles, Package, Plus, Settings, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({
  currentPath,
}: {
  currentPath?: string;
}) {
  // Use usePathname to get current path automatically
  const pathname = usePathname();
  const activePath = currentPath || pathname;

  const navigation = [
    { name: "Dashboard", href: "/staff/dashboard", icon: BarChart3 },
    { name: "Orders", href: "/staff/orders", icon: Package },
    { name: "Add Order", href: "/staff/addOrder", icon: Plus }, // Fixed: was addOrder
    { name: "Reservations", href: "/staff/reservations", icon: Calendar },
    { name: "Settings", href: "/staff/settings", icon: Settings },
  ];

  // Check if path is active (exact match or starts with the path)
  const isActive = (href: string) => {
    // Remove trailing slash for comparison
    const cleanActivePath = activePath.replace(/\/$/, '');
    const cleanHref = href.replace(/\/$/, '');
    
    // Check exact match or if it's a sub-route
    return cleanActivePath === cleanHref || cleanActivePath.startsWith(cleanHref + '/');
  };
  
  return (
    <div className="fixed left-0 top-0 bg-gray-900 text-white w-64 min-h-screen p-6 z-10">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Bubbles className="w-7 h-7" />
          <span className="text-lg font-semibold">NorthEnd Laundry</span>
        </div>
      </div>

      <nav className="space-y-1">
        <div className="text-sm font-semibold text-gray-400 uppercase mb-2">
          Actions
        </div>
        {navigation.map((item, key) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              href={item.href}
              key={key}
              className={`flex items-center space-x-3 py-2 px-3 rounded-lg transition-colors ${
                active
                  ? "bg-purple-100 text-gray-800"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <UserButton showUserInfo />
        </div>
      </div>
    </div>
  );
}