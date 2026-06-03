import { Copy, Truck, Plane } from "lucide-react";
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
    toast.success(`${label} copied`);
  };

  return (
    <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Carrier Handoff</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">Active</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className={`rounded-xl p-4 border ${!inIndia ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/40"}`}>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
            <Plane className="w-3.5 h-3.5" /> International leg {!inIndia && "· current"}
          </div>
          <p className="text-[15px] font-semibold text-foreground mt-1">{meta.courier}</p>
          <button onClick={() => copy(meta.awb, "AWB")} className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            AWB {meta.awb} <Copy className="w-3 h-3" />
          </button>
        </div>

        <div className={`rounded-xl p-4 border ${inIndia ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/40"}`}>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
            <Truck className="w-3.5 h-3.5" /> India last-mile {inIndia && "· current"}
          </div>
          <p className="text-[15px] font-semibold text-foreground mt-1">{meta.indiaCourier}</p>
          <p className="text-[11px] text-muted-foreground mt-2">
            {inIndia ? <>Carrier ref <button onClick={() => copy(meta.courierRef, "Carrier ref")} className="font-mono hover:text-foreground"> {meta.courierRef} <Copy className="w-3 h-3 inline -mt-0.5" /></button></> : `Will activate for ${city || "your city"} after customs clearance`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourierHandoff;