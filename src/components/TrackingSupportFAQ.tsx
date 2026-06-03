import { Link } from "react-router-dom";
import { ChevronDown, LifeBuoy } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "My package hasn't moved in a few days — is it delayed?", a: "International legs often show no scans for 24-72 hours while in flight or in customs. If there's no update after 5 days, message support and we'll escalate with the carrier." },
  { q: "Why is the package routed through Beijing/Istanbul?", a: "Our most reliable Prague → India corridor uses a consolidation hub. This adds 1-2 days but cuts customs delays significantly." },
  { q: "I lost my delivery PIN — what now?", a: "Sign in to ShipNest with the email you used at checkout — the PIN is shown on the order page. You can also request a one-time reset via support." },
  { q: "Can I change my delivery address mid-transit?", a: "Address changes are possible until the package reaches its destination country. Contact support with your order ID and the new address." },
];

const TrackingSupportFAQ = ({ orderId }: { orderId: string }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="bg-secondary/40 border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Where is my package?</h3>
        <Link to={`/contact?order=${orderId}`} className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline font-medium">
          <LifeBuoy className="w-3.5 h-3.5" /> Contact support
        </Link>
      </div>
      <div className="divide-y divide-border">
        {faqs.map((f, i) => (
          <div key={i} className="py-2">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between text-left gap-3 py-1.5">
              <span className="text-[13px] font-medium text-foreground">{f.q}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <p className="text-[12px] text-muted-foreground leading-relaxed pr-6 pb-2">{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingSupportFAQ;