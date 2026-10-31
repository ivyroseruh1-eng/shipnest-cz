import { Globe2, ShieldCheck, KeyRound, Radio } from "lucide-react";

const pillars = [
  {
    icon: Globe2,
    metric: "60+",
    label: "Destination Countries",
    desc: "Direct express air routing from Prague central hub",
  },
  {
    icon: ShieldCheck,
    metric: "100%",
    label: "Authentic Sourcing",
    desc: "Factory sealed hardware & authorized luxury suppliers",
  },
  {
    icon: KeyRound,
    metric: "4-Digit",
    label: "Doorstep PIN Protection",
    desc: "Handover verified securely at delivery destination",
  },
  {
    icon: Radio,
    metric: "Live",
    label: "Milestone Radar Tracking",
    desc: "Real-time updates at customs, flight and dispatch hubs",
  },
];

const LiveStats = () => (
  <section className="border-t border-border bg-[#fafafc] py-16 sm:py-20">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-[12px] text-primary font-semibold uppercase tracking-widest">Platform Integrity</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1.5">
          Engineered for International Trust
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Every shipment is managed under strict European custody protocols from our Prague facility to your doorstep.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((item) => (
          <div
            key={item.label}
            className="bg-card border border-border/80 rounded-2xl p-6 text-center space-y-2 hover:border-foreground/20 transition-all duration-300 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight tabular-nums">
              {item.metric}
            </p>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">{item.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LiveStats;