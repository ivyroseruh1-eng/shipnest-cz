import { Check, Clock, PackageCheck, Plane, ShieldCheck, Sparkles, X } from "lucide-react";
import { TrackingStep } from "@/types";

interface Props {
  status?: string;
  steps?: TrackingStep[];
  isConfirmationPage?: boolean;
}

export const MacroMilestoneStepper = ({
  status,
  steps = [],
  isConfirmationPage = false,
}: Props) => {
  const isCancelled = (status || "").toLowerCase().includes("cancel");
  const isDelivered = (status || "").toLowerCase() === "delivered";

  // Calculate which macro stage (0 to 3) is active
  // Stage 0: Order Confirmed
  // Stage 1: Processing & Packed
  // Stage 2: In Flight Transit
  // Stage 3: Delivered
  let activeMacroIndex = 1; // Default: Stage 1 active (Processing)

  if (isConfirmationPage) {
    activeMacroIndex = 1; // Order confirmed (0 complete), processing (1 active)
  } else if (isDelivered) {
    activeMacroIndex = 3;
  } else if (steps.length > 0) {
    const lastCompletedIdx = steps.reduce(
      (acc, s, i) => (s.completed ? i : acc),
      -1
    );

    // Map 12 tracking steps to 4 macro stages:
    // Steps 0..1 ("Order Received", "Payment Confirmed") -> Macro 0 done, Macro 1 active
    // Steps 2..4 ("Processing", "Packed", "Shipment Created") -> Macro 1 active
    // Steps 5..10 ("Departed Origin", "In Transit", "Customs", "Regional Hub", "Local Hub", "Out for Delivery") -> Macro 2 active
    // Step 11 ("Delivered") -> Macro 3 active/done
    if (lastCompletedIdx >= 11) {
      activeMacroIndex = 3;
    } else if (lastCompletedIdx >= 5) {
      activeMacroIndex = 2;
    } else if (lastCompletedIdx >= 2) {
      activeMacroIndex = 1;
    } else {
      activeMacroIndex = 0;
    }
  }

  const milestones = [
    {
      label: "Order Confirmed",
      sub: "Payment authorized",
    },
    {
      label: "Processing & Packed",
      sub: "Tamper-sealed at hub",
    },
    {
      label: "In Flight Transit",
      sub: "Air corridor dispatch",
    },
    {
      label: "Delivered",
      sub: "PIN handover",
    },
  ];

  if (isCancelled) {
    return (
      <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
          <X className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-destructive">
            Order Consignment Cancelled
          </p>
          <p className="text-[11px] text-muted-foreground">
            Transit terminated. Full refund authorized to original payment method.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      {/* Visual Stepper Track */}
      <div className="relative flex items-center justify-between">
        {/* Continuous Connecting Bar Background */}
        <div className="absolute left-[16px] right-[16px] sm:left-[24px] sm:right-[24px] top-4 sm:top-4 h-[2px] bg-secondary-foreground/10 -translate-y-1/2 z-0" />

        {/* Filled Active Progress Line */}
        <div
          className="absolute left-[16px] sm:left-[24px] top-4 sm:top-4 h-[2px] bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-out"
          style={{
            width: isDelivered
              ? "calc(100% - 32px)"
              : `calc(${Math.min(activeMacroIndex, 3) * 33.333}% - ${
                  activeMacroIndex === 0 ? "16px" : "0px"
                })`,
          }}
        />

        {milestones.map((m, idx) => {
          const isDone = isDelivered || idx < activeMacroIndex || (isConfirmationPage && idx === 0);
          const isCurrent = !isDelivered && (isConfirmationPage ? idx === 1 : idx === activeMacroIndex);
          const isPending = !isDone && !isCurrent;

          return (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-center text-center group flex-1"
            >
              {/* Circle Node */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : isCurrent
                    ? "bg-background border-2 border-primary text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.16)]"
                    : "bg-secondary text-muted-foreground/60 border border-border"
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                ) : (
                  <span className="text-[11px] font-medium">{idx + 1}</span>
                )}
              </div>

              {/* Labels */}
              <div className="mt-2.5 px-1">
                <p
                  className={`text-[11px] sm:text-[12px] font-semibold tracking-tight transition-colors ${
                    isDone || isCurrent ? "text-foreground" : "text-muted-foreground/70"
                  }`}
                >
                  {m.label}
                </p>
                <p className="hidden md:block text-[10px] text-muted-foreground mt-0.5">
                  {m.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MacroMilestoneStepper;
