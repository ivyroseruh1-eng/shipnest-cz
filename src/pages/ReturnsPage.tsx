import { Link } from "react-router-dom";
import { ChevronRight, RotateCcw, Clock, CheckCircle, Package } from "lucide-react";

const steps = [
  { icon: Package, title: "Initiate Return", desc: "Contact us at returns@shipnest.cz with your order number within 30 days of delivery." },
  { icon: Clock, title: "Ship It Back", desc: "We'll send a prepaid return label. Pack the item in its original packaging and drop it off." },
  { icon: CheckCircle, title: "Get Refunded", desc: "Once we receive and inspect the item, your refund is processed within 5–7 business days." },
];

const ReturnsPage = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
    <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground font-medium">Returns & Refunds</span>
    </nav>

    <div className="flex items-center gap-3">
      <div className="p-3 rounded-xl bg-secondary">
        <RotateCcw className="w-6 h-6 text-foreground" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Returns & Refunds</h1>
        <p className="text-[13px] text-muted-foreground mt-1">30-day hassle-free returns on all products</p>
      </div>
    </div>

    {/* Steps */}
    <div className="grid sm:grid-cols-3 gap-4">
      {steps.map((s, i) => (
        <div key={s.title} className="bg-secondary/50 border border-border/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
            <s.icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground text-[15px]">{s.title}</h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>

    <div className="prose prose-sm max-w-none text-foreground/80 space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Return Policy</h2>
        <p>You have 30 days from the date of delivery to return any item for a full refund. This exceeds the 14-day minimum required under EU Directive 2011/83/EU and Czech consumer protection law (zákon č. 634/1992 Sb.).</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Conditions</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Items must be in original condition, unused, with all tags and packaging intact.</li>
          <li>Opened electronics can be returned if defective or not as described.</li>
          <li>Custom-engraved or personalized products are non-returnable.</li>
          <li>Hygiene-sealed items (e.g., earphones) cannot be returned once opened, unless defective.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Refund Processing</h2>
        <p>Refunds are issued to the original payment method within 5–7 business days after we receive and inspect the returned item. You will receive an email confirmation once your refund has been processed.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Warranty Claims</h2>
        <p>All products sold by ShipNest come with a 2-year warranty as required by EU law. If your product is defective within the warranty period, contact us at support@shipnest.cz for repair, replacement, or refund.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Contact</h2>
        <p>For returns, email returns@shipnest.cz or call +420 123 456 789 (Mon–Fri, 9:00–17:00 CET).</p>
      </section>
    </div>
  </div>
);

export default ReturnsPage;
