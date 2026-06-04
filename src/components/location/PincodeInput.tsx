import { useState } from "react";
import { Loader2, Check, MapPin, X } from "lucide-react";
import { lookupPincode, type PincodeResult } from "@/lib/pincode";
import { useLocation } from "@/context/LocationContext";
import { toast } from "sonner";

type Props = {
  onResolved?: (result: PincodeResult) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  autoFocus?: boolean;
};

const PincodeInput = ({
  onResolved,
  placeholder = "Enter postal / PIN code",
  size = "md",
  showLabel = false,
  autoFocus,
}: Props) => {
  const { location, setLocation, clearLocation } = useLocation();
  const [value, setValue] = useState(location?.pincode || "");
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!value.trim()) return;
    setLoading(true);
    const result = await lookupPincode(value.trim());
    setLoading(false);
    if (!result) {
      toast.error("Couldn't find that postal code. Please check and try again.");
      return;
    }
    setLocation(result);
    onResolved?.(result);
    toast.success(`Delivering to ${result.city}, ${result.state}`);
  };

  const handleClear = () => {
    clearLocation();
    setValue("");
  };

  const padding =
    size === "sm" ? "py-2 text-[13px]" : size === "lg" ? "py-4 text-[16px]" : "py-3 text-[14px]";

  return (
    <div className="w-full space-y-2">
      {showLabel && (
        <label className="text-[12px] font-medium text-foreground flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> Delivery location
        </label>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleLookup())}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`w-full bg-background border border-border rounded-lg px-4 ${padding} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary`}
          />
          {location && location.pincode === value && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />
          )}
        </div>
        <button
          type="button"
          onClick={handleLookup}
          disabled={loading || !value.trim()}
          className="bg-primary text-primary-foreground px-5 rounded-lg font-medium text-[13px] hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
        </button>
      </div>

      {location && (
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <MapPin className="w-3 h-3 text-primary" />
          <span>
            <span className="text-foreground font-medium">{location.city}</span>, {location.state}, {location.country} · {location.pincode}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto text-muted-foreground hover:text-foreground"
            aria-label="Clear location"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PincodeInput;