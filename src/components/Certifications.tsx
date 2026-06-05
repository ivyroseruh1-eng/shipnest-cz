import { ShieldCheck, Lock, Award, BadgeCheck, Star } from "lucide-react";
import Reveal from "./Reveal";

const certs = [
  {
    icon: Star,
    title: "Trustpilot",
    badge: "4.9 / 5",
    sub: "8,247 reviews · Excellent",
    accent: "text-success",
  },
  {
    icon: BadgeCheck,
    title: "Authorized Reseller",
    badge: "Verified",
    sub: "Apple · Samsung · Google",
    accent: "text-primary",
  },
  {
    icon: ShieldCheck,
    title: "Shipment Insurance",
    badge: "AIG · up to $5,000",
    sub: "Every parcel, every route",
    accent: "text-foreground",
  },
  {
    icon: Lock,
    title: "PCI-DSS Level 1",
    badge: "256-bit TLS",
    sub: "Payments processed by Adyen",
    accent: "text-foreground",
  },
  {
    icon: Award,
    title: "Czech Trade Registry",
    badge: "IČO 12345678",
    sub: "Prague · est. 2021",
    accent: "text-foreground",
  },
];

const Certifications = () => (
  <section className="border-t border-border bg-background py-14">
    <div className="max-w-[980px] mx-auto px-4">
      <Reveal>
        <p className="text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-8">
          Verified & Insured
        </p>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {certs.map((c, i) => (
          <Reveal key={c.title} delay={i * 80}>
            <div className="bg-secondary/50 border border-border rounded-2xl p-4 h-full hover:bg-secondary transition-colors">
              <div className="flex items-center gap-2">
                <c.icon className={`w-4 h-4 ${c.accent}`} strokeWidth={2} />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{c.title}</span>
              </div>
              <p className="text-[15px] font-semibold text-foreground mt-2 tabular-nums">{c.badge}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{c.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Certifications;