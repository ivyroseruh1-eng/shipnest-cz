import { useState } from "react";
import { MapPin, Edit2, Check } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import PincodeInput from "@/components/location/PincodeInput";

const DeliverTo = () => {
  const { location } = useLocation();
  const [editing, setEditing] = useState(false);

  if (!location || editing) {
    return (
      <div className="border border-border rounded-xl p-4 bg-secondary/40 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Where should we deliver?
          </p>
          {editing && (
            <button onClick={() => setEditing(false)} className="text-[11px] text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          )}
        </div>
        <PincodeInput size="sm" onResolved={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-secondary/40 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
        <Check className="w-4 h-4 text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-foreground">
          Delivering to <span className="font-semibold">{location.city}, {location.state}</span>
        </p>
        <p className="text-[12px] text-muted-foreground">
          {location.country} · {location.pincode} · Express shipping available
        </p>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="text-[12px] text-primary hover:opacity-75 flex items-center gap-1 shrink-0"
      >
        <Edit2 className="w-3 h-3" /> Change
      </button>
    </div>
  );
};

export default DeliverTo;