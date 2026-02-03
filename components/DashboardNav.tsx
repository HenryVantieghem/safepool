"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/live", label: "Live" },
  { href: "/dashboard/incidents", label: "Incidents" },
  { href: "/dashboard/settings", label: "Settings" },
];

type Facility = { id: string; name: string };
type Camera = { id: string; name: string; facility_id: string; status: string };

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedFacilityId, setSelectedFacilityId } = useDashboard();
  const { theme, toggleTheme } = useTheme();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alertsToday, setAlertsToday] = useState<number>(0);
  const [lastIncidentAt, setLastIncidentAt] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [facRes, camRes] = await Promise.all([
        supabase.from("facilities").select("id, name").order("name"),
        supabase.from("cameras").select("id, name, facility_id, status").order("name"),
      ]);
      setFacilities(facRes.data ?? []);
      setCameras(camRes.data ?? []);
      if (facRes.data?.length && !selectedFacilityId) {
        setSelectedFacilityId(facRes.data[0].id);
      }
      const alertsRes = await supabase
        .from("alerts")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date().toISOString().slice(0, 10) + "T00:00:00Z")
        .is("dismissed_at", null);
      setAlertsToday(alertsRes.error ? 0 : (alertsRes.count ?? 0));

      const incRes = await supabase
        .from("incidents")
        .select("detected_at")
        .order("detected_at", { ascending: false })
        .limit(1)
        .single();
      setLastIncidentAt(incRes.data?.detected_at ?? null);
    }
    load();
  }, [setSelectedFacilityId, selectedFacilityId]);

  const filteredCameras = selectedFacilityId
    ? cameras.filter((c) => c.facility_id === selectedFacilityId)
    : cameras;
  const activeCameras = cameras.filter((c) => c.status === "active").length;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function statusColor(status: string) {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "reconnecting":
        return "bg-amber-500";
      default:
        return "bg-zinc-400";
    }
  }

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex h-full flex-col p-4">
        <Link
          href="/dashboard"
          className="mb-4 font-semibold text-teal-deep transition hover:opacity-90 dark:text-aqua-light"
        >
          SafePool
        </Link>

        {facilities.length > 1 && (
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">
              Facility
            </label>
            <select
              value={selectedFacilityId ?? ""}
              onChange={(e) =>
                setSelectedFacilityId(e.target.value || null)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-deep dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">All</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 space-y-0.5">
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
                    ? "bg-teal-deep/10 font-medium text-teal-deep dark:bg-teal-deep/20 dark:text-aqua-light"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-zinc-700">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-500 dark:text-zinc-400">
              <span>Connections</span>
              <Link
                href="/dashboard/settings#cameras"
                className="text-teal-deep hover:underline dark:text-aqua-light"
              >
                Add
              </Link>
            </div>
            <ul className="space-y-1">
              {filteredCameras.length === 0 ? (
                <li className="text-xs text-gray-500 dark:text-zinc-400">
                  No cameras yet
                </li>
              ) : (
                filteredCameras.slice(0, 6).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300"
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusColor(c.status)}`}
                      title={c.status}
                    />
                    <span className="truncate">{c.name}</span>
                  </li>
                ))
              )}
              {filteredCameras.length > 6 && (
                <li className="text-xs text-gray-500 dark:text-zinc-400">
                  +{filteredCameras.length - 6} more
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-1 text-xs text-gray-500 dark:text-zinc-400">
            <p>{activeCameras} active camera{activeCameras !== 1 ? "s" : ""}</p>
            <p>{alertsToday} alert{alertsToday !== 1 ? "s" : ""} today</p>
            {lastIncidentAt && (
              <p>Last incident: {new Date(lastIncidentAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            onClick={handleSignOut}
            className="rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
