import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import PincodeInput from "./PincodeInput";

const LocationChip = () => {
  const { location } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground transition-colors text-[12px]"
      >
        <MapPin className="w-3.5 h-3.5" />
        {location ? (
          <span className="hidden sm:inline">
            Deliver to <span className="font-medium text-foreground">{location.city}</span> {location.pincode}
          </span>
        ) : (
          <span>Set delivery location</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-xl shadow-lg p-4 z-50 animate-fade-in">
            <p className="text-[13px] font-semibold text-foreground mb-1">Where should we deliver?</p>
            <p className="text-[11px] text-muted-foreground mb-3">Enter your postal code to see delivery options.</p>
            <PincodeInput onResolved={() => setOpen(false)} size="sm" />
          </div>
        </>
      )}
    </div>
  );
};

export default LocationChip;