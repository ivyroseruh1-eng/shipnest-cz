import { Package, Warehouse, Plane, Home } from "lucide-react";
import Reveal from "@/components/Reveal";

const steps = [
  { icon: Package, title: "Order", body: "Pick your device. Pay securely. Get instant confirmation." },
  { icon: Warehouse, title: "Prague hub", body: "Sealed, inspected, and dispatched within 24 hours." },
  { icon: Plane, title: "Express transit", body: "Routed via DHL, FedEx or UPS with real-time tracking." },
  { icon: Home, title: "At your door", body: "Local last-mile delivery with signature on receipt." },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-[980px] mx-auto px-4">
        <Reveal>
          <div className="text-center mb-12">
            <p className="text-[12px] text-primary font-medium uppercase tracking-wider mb-2">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              From Prague to your door.
            </h2>
            <p className="text-[15px] text-muted-foreground mt-3 max-w-xl mx-auto">
              Every order follows the same trusted path — engineered for speed, security and visibility.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div className="relative bg-secondary/50 rounded-2xl p-6 h-full hover:bg-secondary transition-colors">
                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-4">
                  <s.icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">Step {i + 1}</p>
                <h3 className="text-[16px] font-semibold text-foreground mt-1">{s.title}</h3>
                <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;