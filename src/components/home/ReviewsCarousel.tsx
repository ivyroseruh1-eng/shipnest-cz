import { ShieldCheck, Plane, KeyRound, Headphones, CheckCircle2 } from "lucide-react";
import Reveal from "@/components/Reveal";

const commitments = [
  {
    icon: ShieldCheck,
    title: "100% Verified Origin",
    body: "Every product is inspected, authenticated, and sealed under strict custody at our Central European logistics hub in Prague.",
    badge: "Audited Sourcing",
  },
  {
    icon: Plane,
    title: "Express Air Freight",
    body: "Dispatched direct via premier global air express partners (DHL, FedEx, UPS) with customs clearance documentation prepared.",
    badge: "Direct Routing",
  },
  {
    icon: KeyRound,
    title: "Doorstep PIN Verification",
    body: "Your order is protected by an encrypted 4-digit delivery PIN, ensuring handover occurs exclusively into authorized hands.",
    badge: "Tamper Protection",
  },
  {
    icon: Headphones,
    title: "Dedicated Concierge",
    body: "Direct access to our specialists for order milestone monitoring, luxury inquiries, and regional compatibility confirmation.",
    badge: "White-Glove Support",
  },
];

const ReviewsCarousel = () => {
  return (
    <section className="py-16 sm:py-20 bg-background border-t border-border">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[12px] text-primary font-semibold uppercase tracking-widest mb-1.5">
              Service Guarantees
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              The ShipNest Standard
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              Transparent, accountable international fulfillment. We replace arbitrary claims with verifiable custody and milestone scanning.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {commitments.map((c) => (
            <div
              key={c.title}
              className="bg-card border border-border/80 rounded-2xl p-6 space-y-3 hover:border-foreground/20 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <c.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {c.badge}
                  </span>
                </div>
                <h3 className="text-[16px] font-bold text-foreground">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
              </div>

              <div className="pt-3 border-t border-border/60 text-[11px] font-medium text-muted-foreground">
                Prague Hub Protocol
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;