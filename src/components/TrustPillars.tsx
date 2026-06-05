import { Shield, Globe, Activity, Headphones, Lock } from "lucide-react";

const pillars = [
  { icon: Shield, title: "Secure Payments", body: "256-bit encryption and PCI-DSS compliance on every transaction." },
  { icon: Globe, title: "Global Shipping", body: "60+ countries served from our Prague hub." },
  { icon: Activity, title: "Real-Time Tracking", body: "16-step transparent timeline from warehouse to door." },
  { icon: Headphones, title: "24/7 Support", body: "A human responds in under 4 hours, day or night." },
  { icon: Lock, title: "Protected Deliveries", body: "4-digit PIN handover ensures only you receive it." },
];

const TrustPillars = () => (
  <section className="border-t border-border bg-secondary/40 py-16">
    <div className="max-w-[980px] mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Why shop with ShipNest</h2>
        <p className="text-[14px] text-muted-foreground mt-2">The trust you'd expect from a marketplace ten times our size.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {pillars.map(p => (
          <div key={p.title} className="bg-background border border-border rounded-2xl p-5 text-center">
            <p.icon className="w-6 h-6 mx-auto text-foreground" strokeWidth={1.5} />
            <h3 className="text-[14px] font-semibold text-foreground mt-3">{p.title}</h3>
            <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustPillars;