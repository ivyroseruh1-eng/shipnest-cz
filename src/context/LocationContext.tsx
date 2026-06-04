import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { PincodeResult } from "@/lib/pincode";

type Ctx = {
  location: PincodeResult | null;
  setLocation: (loc: PincodeResult | null) => void;
  clearLocation: () => void;
};

const LocationContext = createContext<Ctx | undefined>(undefined);
const STORAGE_KEY = "shipnest.location.v1";

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocationState] = useState<PincodeResult | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLocationState(JSON.parse(raw));
    } catch {}
  }, []);

  const setLocation = (loc: PincodeResult | null) => {
    setLocationState(loc);
    try {
      if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const clearLocation = () => setLocation(null);

  return (
    <LocationContext.Provider value={{ location, setLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
};