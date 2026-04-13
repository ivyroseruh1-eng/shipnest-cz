import { TrackingStep } from "@/types";

interface Props {
  steps: TrackingStep[];
}

const TrackingTimeline = ({ steps }: Props) => {
  const lastCompletedIdx = steps.reduce((acc, s, i) => (s.completed ? i : acc), -1);
  const isCancelled = steps.some(s => s.status.includes("Cancelled"));

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
            {/* Vertical line */}
            {i < steps.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-full"
                style={{ background: isCancelStep || isReturnStep ? (isCompleted ? "#f97316" : "hsl(210 40% 22%)") : isCompleted ? "hsl(45 70% 47%)" : "hsl(210 40% 22%)" }} />
            )}
            {/* Icon circle */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg border-2
              ${isCancelStep ? "border-red-500 bg-red-500/20" : isReturnStep ? (isCompleted ? "border-orange-500 bg-orange-500/20" : "border-border bg-muted") : isCurrent ? "border-accent bg-accent/20 blue-glow" : isCompleted ? "border-primary bg-primary/20" : "border-border bg-muted"}`}>
              {isCurrent && !isCancelStep && <span className="absolute w-3 h-3 rounded-full bg-accent animate-pulse" />}
              <span>{step.icon}</span>
            </div>
            {/* Content */}
            <div className={`pb-8 ${isPending && !isCancelStep ? "opacity-40" : ""}`}>
              <p className={`font-semibold text-sm ${isCancelStep ? "text-red-500" : isReturnStep ? (isCompleted ? "text-orange-500" : "text-muted-foreground") : isCurrent ? "text-accent" : isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                {step.status}
              </p>
              <p className="text-xs text-muted-foreground">
                {[step.city, step.state, step.country].filter(Boolean).join(", ")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isCompleted && step.timestamp ? new Date(step.timestamp).toLocaleString() : "Pending"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrackingTimeline;
