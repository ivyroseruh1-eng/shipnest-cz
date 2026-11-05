import { TrackingStep } from "@/types";
import {
  Package,
  Warehouse,
  Plane,
  Truck,
  MapPin,
  CheckCircle2,
  Building2,
  Bike,
  XCircle,
  RotateCcw,
  Clock,
} from "lucide-react";

const iconFor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("cancel")) return XCircle;
  if (s.startsWith("return")) return RotateCcw;
  if (s.includes("delivered")) return CheckCircle2;
  if (s.includes("out for delivery")) return Bike;
  if (
    s.includes("dispatch") ||
    s.includes("local delivery") ||
    s.includes("regional hub") ||
    s.includes("moving to")
  )
    return Truck;
  if (
    s.includes("transit") ||
    s.includes("departed") ||
    s.includes("flight")
  )
    return Plane;
  if (s.includes("warehouse") || s.includes("processing")) return Warehouse;
  if (s.includes("hub") || s.includes("arrived")) return Building2;
  if (s.includes("place") || s.includes("order")) return Package;
  return MapPin;
};

interface Props {
  steps: TrackingStep[];
  placedAt?: string;
}

const TrackingTimeline = ({ steps, placedAt }: Props) => {
  const lastCompletedIdx = steps.reduce(
    (acc, s, i) => (s.completed ? i : acc),
    -1
  );

  return (
    <div className="relative pl-1 sm:pl-2">
      {steps.map((step, i) => {
        const isCompleted = step.completed;
        const isCurrent = i === lastCompletedIdx;
        const isPending = !isCompleted;
        const isCancelStep = step.status.includes("Cancelled");
        const isReturnStep = step.status.startsWith("Return:");

        const Icon = iconFor(step.status);

        return (
          <div key={step.id || i} className="relative flex gap-4 sm:gap-6 group">
            {/* Continuous Vertical Track Line */}
            {i < steps.length - 1 && (
              <div
                className="absolute left-[17px] sm:left-[19px] top-10 w-[2px] h-[calc(100%-8px)] transition-colors duration-300"
                style={{
                  backgroundColor:
                    isCancelStep || isReturnStep
                      ? isCompleted
                        ? "rgb(249, 115, 22)"
                        : "hsl(var(--border))"
                      : isCompleted
                      ? "hsl(var(--primary))"
                      : "hsl(var(--border) / 0.8)",
                }}
              />
            )}

            {/* Step Icon Node */}
            <div
              className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 ${
                isCancelStep
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : isReturnStep
                  ? isCompleted
                    ? "border-orange-500 bg-orange-500/10 text-orange-600"
                    : "border-border bg-secondary/80 text-muted-foreground"
                  : isCurrent
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]"
                  : isCompleted
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/80 bg-secondary/50 text-muted-foreground/60"
              }`}
            >
              {isCurrent && !isCancelStep && (
                <span className="absolute -inset-1 rounded-full bg-primary/20 animate-ping pointer-events-none" />
              )}
              <Icon
                className="w-4 h-4"
                strokeWidth={isCurrent || isCompleted ? 2.2 : 1.75}
              />
            </div>

            {/* Milestone Text Content */}
            <div
              className={`pb-7 sm:pb-8 flex-1 min-w-0 ${
                isPending && !isCancelStep ? "opacity-50" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`text-[13px] sm:text-[14px] font-semibold tracking-tight ${
                      isCancelStep
                        ? "text-destructive"
                        : isReturnStep
                        ? isCompleted
                          ? "text-orange-600"
                          : "text-muted-foreground"
                        : isCurrent
                        ? "text-foreground font-bold"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.status}
                  </p>
                  {isCurrent && !isCancelStep && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Active Scan
                    </span>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                  {isCompleted && step.timestamp ? (
                    new Date(step.timestamp).toLocaleString("en-GB", {
                      timeZone: "Europe/Prague",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) + " CET"
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground/60">
                      <Clock className="w-3 h-3" /> Scheduled
                    </span>
                  )}
                </span>
              </div>

              {/* Location Badge */}
              <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
                <span>
                  {[step.city, step.state, step.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrackingTimeline;
