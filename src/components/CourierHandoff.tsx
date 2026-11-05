import { Copy, Truck, Plane, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { ShipmentMeta } from "@/lib/courier";

interface Props {
  meta: ShipmentMeta;
  inIndia: boolean;
  city: string;
}

const CourierHandoff = ({ meta, inIndia, city }: Props) => {
  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">
            Carrier Custody & Handoff
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Synchronized logistics handoff between European air cargo and regional partner
          </p>
        </div>
        <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Direct Manifest
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* International Leg */}
        <div
          className={`rounded-2xl p-5 border transition-all ${
            !inIndia
              ? "border-primary/40 bg-primary/5 shadow-xs"
              : "border-border bg-secondary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-primary" />
              Leg 1 · International Air Freight
            </span>
            {!inIndia && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                Active Leg
              </span>
            )}
          </div>
          <p className="text-[16px] font-bold text-foreground mt-2">
            {meta.courier}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {meta.originFacility}
          </p>

          <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
            <div className="text-[11px]">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">
                Air Waybill (AWB)
              </span>
              <span className="font-mono font-bold text-foreground">
                {meta.awb}
              </span>
            </div>
            <button
              onClick={() => copy(meta.awb, "Air Waybill")}
              className="p-1.5 rounded-lg border border-border hover:bg-background bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Copy AWB"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Destination / Last-Mile Leg */}
        <div
          className={`rounded-2xl p-5 border transition-all ${
            inIndia
              ? "border-primary/40 bg-primary/5 shadow-xs"
              : "border-border bg-secondary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary" />
              Leg 2 · Final Doorstep Delivery
            </span>
            {inIndia && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                Active Leg
              </span>
            )}
          </div>
          <p className="text-[16px] font-bold text-foreground mt-2">
            {meta.indiaCourier}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {meta.indiaFacility}
          </p>

          <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
            <div className="text-[11px]">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">
                Carrier Reference
              </span>
              <span className="font-mono font-bold text-foreground">
                {inIndia ? meta.courierRef : "Assigned on arrival"}
              </span>
            </div>
            {inIndia && (
              <button
                onClick={() => copy(meta.courierRef, "Carrier reference")}
                className="p-1.5 rounded-lg border border-border hover:bg-background bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Copy Reference"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierHandoff;
