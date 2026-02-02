"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Facility = {
  id: string;
  name: string;
  address: string | null;
};

type Camera = {
  id: string;
  facility_id: string;
  name: string;
  stream_url: string | null;
  status: string;
};

type AlertSettings = {
  facility_id: string;
  sensitivity: string;
  cooldown_seconds: number;
};

export default function SettingsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alertSettings, setAlertSettings] = useState<Record<string, AlertSettings>>({});
  const [loading, setLoading] = useState(true);
  const [newFacility, setNewFacility] = useState({ name: "", address: "" });
  const [newCamera, setNewCamera] = useState({
    facility_id: "",
    name: "",
    stream_url: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [facRes, camRes, setRes] = await Promise.all([
        supabase.from("facilities").select("*").order("name"),
        supabase.from("cameras").select("*").order("name"),
        supabase.from("alert_settings").select("*"),
      ]);
      setFacilities(facRes.data ?? []);
      setCameras(camRes.data ?? []);
      const settingsMap: Record<string, AlertSettings> = {};
      (setRes.data ?? []).forEach((s: AlertSettings) => {
        settingsMap[s.facility_id] = s;
      });
      setAlertSettings(settingsMap);
      setLoading(false);
    }
    load();
  }, []);

  async function addFacility(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data } = await supabase
      .from("facilities")
      .insert({ name: newFacility.name, address: newFacility.address || null })
      .select()
      .single();
    if (data) {
      setFacilities((prev) => [...prev, data]);
      setNewFacility({ name: "", address: "" });
    }
  }

  async function addCamera(e: React.FormEvent) {
    e.preventDefault();
    if (!newCamera.facility_id || !newCamera.name) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("cameras")
      .insert({
        facility_id: newCamera.facility_id,
        name: newCamera.name,
        stream_url: newCamera.stream_url || null,
      })
      .select()
      .single();
    if (data) {
      setCameras((prev) => [...prev, data]);
      setNewCamera({ facility_id: "", name: "", stream_url: "" });
    }
  }

  async function updateSensitivity(facilityId: string, sensitivity: string) {
    const supabase = createClient();
    await supabase
      .from("alert_settings")
      .upsert({ facility_id: facilityId, sensitivity }, { onConflict: "facility_id" });
    setAlertSettings((prev) => ({
      ...prev,
      [facilityId]: { ...prev[facilityId], facility_id: facilityId, sensitivity, cooldown_seconds: prev[facilityId]?.cooldown_seconds ?? 30 },
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-deep border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-bold text-teal-deep">Settings</h1>
      <p className="text-gray-600">
        Manage facilities, cameras, and alert sensitivity.
      </p>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-teal-deep">
          Facilities
        </h2>
        <form onSubmit={addFacility} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Facility name"
            value={newFacility.name}
            onChange={(e) => setNewFacility((p) => ({ ...p, name: e.target.value }))}
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Address (optional)"
            value={newFacility.address}
            onChange={(e) => setNewFacility((p) => ({ ...p, address: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-teal-deep px-4 py-2 text-sm text-white hover:bg-teal-dark"
          >
            Add
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {facilities.map((f) => (
            <li key={f.id} className="flex items-center justify-between text-sm">
              <span>{f.name}</span>
              {f.address && (
                <span className="text-gray-500">{f.address}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-teal-deep">
          Cameras
        </h2>
        <form onSubmit={addCamera} className="mt-4 flex flex-wrap gap-2">
          <select
            value={newCamera.facility_id}
            onChange={(e) =>
              setNewCamera((p) => ({ ...p, facility_id: e.target.value }))
            }
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select facility</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Camera name"
            value={newCamera.name}
            onChange={(e) =>
              setNewCamera((p) => ({ ...p, name: e.target.value }))
            }
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Stream URL (optional)"
            value={newCamera.stream_url}
            onChange={(e) =>
              setNewCamera((p) => ({ ...p, stream_url: e.target.value }))
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-teal-deep px-4 py-2 text-sm text-white hover:bg-teal-dark"
          >
            Add
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {cameras.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm">
              <span>{c.name}</span>
              <span className="text-gray-500">
                {facilities.find((f) => f.id === c.facility_id)?.name}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-teal-deep">
          Alert Sensitivity
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Lower sensitivity = fewer false alarms, may miss subtle distress.
          Higher = more alerts, may increase false positives.
        </p>
        <div className="mt-4 space-y-4">
          {facilities.map((f) => (
            <div key={f.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{f.name}</span>
              <select
                value={alertSettings[f.id]?.sensitivity ?? "medium"}
                onChange={(e) => updateSensitivity(f.id, e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
