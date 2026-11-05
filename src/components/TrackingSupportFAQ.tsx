import { Link } from "react-router-dom";
import { ChevronDown, LifeBuoy, ShieldCheck, HelpCircle } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "My package hasn't moved in a few days — is it delayed?",
    a: "International air cargo corridors often show no intermediate scans for 24–72 hours while shipments are in mid-air transit or undergoing customs documentation processing. This is standard procedure for direct European air freight. If there is no scan update after 5 business days, our dedicated logistics concierge will escalate directly with the air carrier.",
  },
  {
    q: "How does the 4-digit Doorstep Verification PIN protect my delivery?",
    a: "Every ShipNest consignment is assigned an encrypted 4-digit verification code. Our delivery courier cannot complete the handover scan without this PIN, guaranteeing that only the authorized recipient can accept and unseal the package.",
  },
  {
    q: "I misplaced or did not receive my delivery PIN — how can I retrieve it?",
    a: "Your Doorstep Verification PIN is always displayed live on this official tracking page and was sent to your checkout confirmation email. You can also contact ShipNest concierge support for instant verification and PIN re-dispatch.",
  },
  {
    q: "Can I update or redirect my delivery address mid-transit?",
    a: "Address changes and delivery instruction updates can be accommodated while your consignment is in international air transit prior to arrival at the regional delivery hub. Please contact support immediately with your order ID.",
  },
];

const TrackingSupportFAQ = ({ orderId }: { orderId: string }) => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">
              Frequently Asked Questions
            </h3>
          </div>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Transparent guidance regarding air transit, customs clearance, and PIN handover
          </p>
        </div>
        <Link
          to={`/contact?order=${orderId}`}
          className="inline-flex items-center gap-2 text-[12px] font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 px-3.5 py-1.5 rounded-full border border-primary/20 transition-colors w-fit"
        >
          <LifeBuoy className="w-3.5 h-3.5" /> Contact Logistics Concierge
        </Link>
      </div>

      <div className="divide-y divide-border/70">
        {faqs.map((f, i) => (
          <div key={i} className="py-3.5 first:pt-0 last:pb-0">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between text-left gap-4 py-1 group"
              aria-expanded={open === i}
            >
              <span className="text-[14px] font-medium text-foreground group-hover:text-primary transition-colors">
                {f.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                  open === i ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>
            {open === i && (
              <p className="text-[13px] text-muted-foreground leading-relaxed pt-2 pr-6">
                {f.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingSupportFAQ;
