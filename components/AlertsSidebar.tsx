"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";

const ALERT_SOUND_COOLDOWN_MS = 15000;
const ALERT_VOLUME = 0.5;
const MUTE_KEY = "safepool-alerts-mute";

type Alert = {
  id: string;
  facility_id: string;
  camera_id: string | null;
  severity: string;
  trigger_type: string;
  description: string | null;
  frame_data: Record<string, unknown> | null;
  thumbnail_url: string | null;
  created_at: string;
  dismissed_at: string | null;
  cameras?: { name: string } | { name: string }[] | null;
};

type AlertsSidebarProps = {
  facilityId?: string | null;
  compact?: boolean;
};

export function AlertsSidebar({ facilityId: facilityIdProp, compact = false }: AlertsSidebarProps) {
  const { selectedFacilityId } = useDashboard();
  const facilityId = facilityIdProp ?? selectedFacilityId;
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(MUTE_KEY) === "1";
  });
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [collapsed, setCollapsed] = useState(false);
  const lastSoundRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchAlerts = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("alerts")
      .select("id, facility_id, camera_id, severity, trigger_type, description, frame_data, thumbnail_url, created_at, dismissed_at, cameras(name)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (facilityId) {
      query = query.eq("facility_id", facilityId);
    }

    const { data } = await query;
    setAlerts((data as Alert[]) ?? []);
    setLoading(false);
  }, [facilityId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
        },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            setAlerts((prev) => [payload.new as Alert, ...prev].slice(0, 50));
            if (!muted && typeof window !== "undefined") {
              const now = Date.now();
              if (now - lastSoundRef.current > ALERT_SOUND_COOLDOWN_MS) {
                lastSoundRef.current = now;
                try {
                  const audio = audioRef.current ?? new Audio("/demo/alert.mp3");
                  audio.volume = ALERT_VOLUME;
                  audio.play().catch(() => {});
                  if (!audioRef.current) audioRef.current = audio;
                } catch {
                  // ignore
                }
              }
            }
          } else if (payload.eventType === "UPDATE" && payload.new) {
            setAlerts((prev) =>
              prev.map((a) => (a.id === (payload.new as Alert).id ? (payload.new as Alert) : a))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [muted]);

  const dismissAlert = useCallback(async (id: string) => {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed_at: new Date().toISOString() }),
    });
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, dismissed_at: new Date().toISOString() } : a
      )
    );
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (typeof window !== "undefined") {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      }
      return next;
    });
  }, []);

  const openAlerts = alerts.filter((a) => !a.dismissed_at);
  const filteredAlerts =
    filterSeverity === "all"
      ? openAlerts
      : openAlerts.filter((a) => a.severity === filterSeverity);

  if (collapsed) {
    return (
      <aside className="flex w-10 flex-shrink-0 flex-col border-l border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-teal-deep dark:hover:text-aqua-light"
          title="Expand alerts"
        >
          <span className="text-lg font-semibold">{openAlerts.length}</span>
          <span className="text-xs">Alerts</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`flex flex-shrink-0 flex-col border-l border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 ${
        compact ? "w-64" : "w-80"
      }`}
    >
      <div className="flex flex-col border-b border-gray-200 p-3 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-zinc-100">
            Alerts
          </h2>
          <div className="flex items-center gap-1">
            {openAlerts.length > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                {openAlerts.length}
              </span>
            )}
            <button
              type="button"
              onClick={toggleMute}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
              title={muted ? "Unmute alerts" : "Mute alerts"}
            >
              {muted ? (
                <span className="text-sm">🔇</span>
              ) : (
                <span className="text-sm">🔔</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700"
              title="Collapse"
            >
              →
            </button>
          </div>
        </div>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="mt-2 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <option value="all">All severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-deep border-t-transparent" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-zinc-400">
            No active alerts
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredAlerts.map((alert) => {
              const cameraName = Array.isArray(alert.cameras)
                ? alert.cameras[0]?.name
                : (alert.cameras as { name?: string } | null)?.name;
              return (
                <li
                  key={alert.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-zinc-600 dark:bg-zinc-800/50"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {new Date(alert.created_at).toLocaleString()} · {cameraName ?? "—"}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-zinc-100">
                        {alert.severity}
                      </p>
                      {alert.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 dark:text-zinc-400">
                          {alert.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => dismissAlert(alert.id)}
                      className="shrink-0 rounded px-2 py-1 text-xs text-teal-deep hover:bg-teal-deep/10 dark:text-aqua-light dark:hover:bg-aqua-light/10"
                    >
                      Dismiss
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
