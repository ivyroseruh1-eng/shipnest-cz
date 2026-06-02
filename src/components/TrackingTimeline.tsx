import { TrackingStep } from "@/types";
import { getScheduledTimestamp } from "@/context/OrderContext";
import { Package, Warehouse, Plane, Truck, MapPin, CheckCircle2, Building2, Bike, XCircle, RotateCcw } from "lucide-react";

const iconFor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("cancel")) return XCircle;
  if (s.startsWith("return")) return RotateCcw;
  if (s.includes("delivered")) return CheckCircle2;
  if (s.includes("out for delivery")) return Bike;
  if (s.includes("dispatch") || s.includes("local delivery") || s.includes("regional hub") || s.includes("moving to")) return Truck;
  if (s.includes("transit") || s.includes("departed") || s.includes("flight")) return Plane;
  if (s.includes("warehouse") || s.includes("processing")) return Warehouse;
  if (s.includes("hub") || s.includes("arrived")) return Building2;
  if (s.includes("place")) return Package;
  return MapPin;
};

interface Props {
  steps: TrackingStep[];
  placedAt?: string;
}

const TrackingTimeline = ({ steps, placedAt }: Props) => {
  const lastCompletedIdx = steps.reduce((acc, s, i) => (s.completed ? i : acc), -1);

  const formatEta = (i: number) => {
    if (!placedAt) return "Pending";
    const sched = getScheduledTimestamp(placedAt, i);
    const opts: Intl.DateTimeFormatOptions = { timeZone: "Europe/Prague", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
    const isOutForDelivery = steps[i]?.status === "Out for Delivery";
    return `Est. ${sched.toLocaleString("en-GB", opts)}${isOutForDelivery ? " · 9 AM – 6 PM window" : ""}`;
  };

  return (
    <div className="relative space-y-0">
      {steps.map((step, i) => {
        const isCompleted = step.completed;
        const isCurrent = i === lastCompletedIdx;
        const isPending = !isCompleted;
        const isCancelStep = step.status.includes("Cancelled");
        const isReturnStep = step.status.startsWith("Return:");

        const Icon = iconFor(step.status);
        return (
          <div key={step.id} className="relative flex gap-4">
            {i < steps.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-full"
                style={{ background: isCancelStep || isReturnStep ? (isCompleted ? "hsl(20 90% 55%)" : "hsl(var(--border))") : isCompleted ? "hsl(var(--primary))" : "hsl(var(--border))" }} />
            )}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all
              ${isCancelStep ? "border-destructive bg-destructive/10" : isReturnStep ? (isCompleted ? "border-orange-500 bg-orange-500/10" : "border-border bg-secondary") : isCurrent ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]" : isCompleted ? "border-primary bg-primary/10" : "border-border bg-secondary"}`}>
              {isCurrent && !isCancelStep && <span className="absolute -inset-1 rounded-full bg-primary/20 animate-ping" />}
              <Icon className={`w-4 h-4 ${isCancelStep ? "text-destructive" : isReturnStep ? (isCompleted ? "text-orange-500" : "text-muted-foreground") : isCurrent ? "" : isCompleted ? "text-primary" : "text-muted-foreground"}`} strokeWidth={2} />
            </div>
            <div className={`pb-8 flex-1 ${isPending && !isCancelStep ? "opacity-50" : ""}`}>
              <p className={`font-semibold text-[14px] ${isCancelStep ? "text-destructive" : isReturnStep ? (isCompleted ? "text-orange-500" : "text-muted-foreground") : isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                {step.status}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {[step.city, step.state, step.country].filter(Boolean).join(", ")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isCompleted && step.timestamp
                  ? new Date(step.timestamp).toLocaleString("en-GB", { timeZone: "Europe/Prague", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                  : isPending && !isCancelStep && !isReturnStep ? formatEta(i) : "Pending"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrackingTimeline;
