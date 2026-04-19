import { TrackingStep } from "@/types";
import { getScheduledTimestamp } from "@/context/OrderContext";

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

        return (
          <div key={step.id} className="relative flex gap-4">
            {i < steps.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-full"
                style={{ background: isCancelStep || isReturnStep ? (isCompleted ? "hsl(20 90% 55%)" : "hsl(var(--border))") : isCompleted ? "hsl(var(--primary))" : "hsl(var(--border))" }} />
            )}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg border-2 transition-all
              ${isCancelStep ? "border-destructive bg-destructive/10" : isReturnStep ? (isCompleted ? "border-orange-500 bg-orange-500/10" : "border-border bg-secondary") : isCurrent ? "border-primary bg-primary/10" : isCompleted ? "border-primary bg-primary/5" : "border-border bg-secondary"}`}>
              {isCurrent && !isCancelStep && <span className="absolute w-3 h-3 rounded-full bg-primary animate-pulse" />}
              <span>{step.icon}</span>
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
