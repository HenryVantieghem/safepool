"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Incident = {
  id: string;
  facility_id: string;
  camera_id: string | null;
  severity: string;
  detected_at: string;
  frame_data: Record<string, unknown> | null;
  resolved_at: string | null;
  facilities?: { name?: string } | { name?: string }[] | null;
  cameras?: { name?: string } | { name?: string }[] | null;
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filterResolved, setFilterResolved] = useState<"all" | "open" | "resolved">("all");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let query = supabase
        .from("incidents")
        .select(
          "id, facility_id, camera_id, severity, detected_at, frame_data, resolved_at, facilities(name), cameras(name)"
        )
        .order("detected_at", { ascending: false });

      if (filterResolved === "open") {
        query = query.is("resolved_at", null);
      } else if (filterResolved === "resolved") {
        query = query.not("resolved_at", "is", null);
      }

      const { data } = await query;
      setIncidents(data ?? []);
      setLoading(false);
    }
    load();
  }, [filterResolved]);

  async function resolveIncident(id: string) {
    const supabase = createClient();
    await supabase
      .from("incidents")
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", id);
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, resolved_at: new Date().toISOString() } : i
      )
    );
    setSelected(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-deep border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-teal-deep">Incidents</h1>
        <select
          value={filterResolved}
          onChange={(e) =>
            setFilterResolved(e.target.value as "all" | "open" | "resolved")
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="open">Open only</option>
          <option value="resolved">Resolved only</option>
        </select>
      </div>
      <p className="mt-2 text-gray-600">
        Review and resolve detected distress events.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Facility
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Camera
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No incidents yet.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(inc.detected_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {Array.isArray(inc.facilities)
                      ? inc.facilities[0]?.name ?? "—"
                      : (inc.facilities as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {Array.isArray(inc.cameras)
                      ? inc.cameras[0]?.name ?? "—"
                      : (inc.cameras as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline rounded px-2 py-1 text-xs font-medium ${
                        inc.severity === "high"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {inc.resolved_at ? "Resolved" : "Open"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(inc)}
                      className="text-sm text-teal-deep hover:underline"
                    >
                      View
                    </button>
                    {!inc.resolved_at && (
                      <>
                        {" · "}
                        <button
                          onClick={() => resolveIncident(inc.id)}
                          className="text-sm text-teal-deep hover:underline"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-lg font-semibold text-teal-deep">
              Incident Details
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Time</dt>
                <dd>{new Date(selected.detected_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Severity</dt>
                <dd>{selected.severity}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Description</dt>
                <dd>
                  {selected.frame_data &&
                  typeof selected.frame_data === "object" &&
                  "description" in selected.frame_data
                    ? String(selected.frame_data.description)
                    : "—"}
                </dd>
              </div>
            </dl>
            {!selected.resolved_at && (
              <button
                onClick={() => resolveIncident(selected.id)}
                className="mt-4 rounded-lg bg-teal-deep px-4 py-2 text-white hover:bg-teal-dark"
              >
                Mark Resolved
              </button>
            )}
            <button
              onClick={() => setSelected(null)}
              className="mt-4 ml-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
