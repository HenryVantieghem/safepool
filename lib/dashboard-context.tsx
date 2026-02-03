"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const FACILITY_KEY = "safepool-selected-facility";

type DashboardContextValue = {
  selectedFacilityId: string | null;
  setSelectedFacilityId: (id: string | null) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  children,
  initialFacilityId,
}: {
  children: React.ReactNode;
  initialFacilityId?: string | null;
}) {
  const [selectedFacilityId, setState] = useState<string | null>(() => {
    if (typeof window === "undefined") return initialFacilityId ?? null;
    const stored = localStorage.getItem(FACILITY_KEY);
    return stored || initialFacilityId ?? null;
  });

  const setSelectedFacilityId = useCallback((id: string | null) => {
    setState(id);
    if (typeof window !== "undefined") {
      if (id) localStorage.setItem(FACILITY_KEY, id);
      else localStorage.removeItem(FACILITY_KEY);
    }
  }, []);

  useEffect(() => {
    if (initialFacilityId && !selectedFacilityId) {
      setState(initialFacilityId);
    }
  }, [initialFacilityId, selectedFacilityId]);

  return (
    <DashboardContext.Provider
      value={{ selectedFacilityId, setSelectedFacilityId }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
