"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/live", label: "Live Feeds" },
  { href: "/dashboard/incidents", label: "Incidents" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-56 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col p-4">
        <Link
          href="/dashboard"
          className="mb-6 font-serif text-xl font-semibold text-teal-deep"
        >
          SafePool
        </Link>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-teal-deep/10 text-teal-deep font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleSignOut}
          className="mt-4 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
