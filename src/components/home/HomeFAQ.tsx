import { ChevronDown } from "lucide-react";
import Reveal from "@/components/Reveal";

const faqs = [
  {
    q: "How fast does ShipNest deliver?",
    a: "Every order ships from our Prague hub via express partners (DHL, FedEx, UPS). Your exact delivery date is calculated and confirmed at checkout based on your address.",
  },
  {
    q: "Are products genuine and sealed?",
    a: "Yes. Every device is brand-new, sealed in original manufacturer packaging, with serial numbers verifiable on the brand's official site. ShipNest is an authorized retailer.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major networks — Visa, Mastercard, Amex — plus Apple Pay and Google Pay, with 256-bit AES encryption on every order.",
  },
  {
    q: "What's your return policy?",
    a: "30 days, no questions asked. If you're not happy, send it back for a full refund. Items must be in original condition with packaging.",
  },
  {
    q: "How do I track my order?",
    a: "You'll receive a tracking ID by email the moment your order ships, with live updates at every milestone. Or visit the Track page anytime.",
  },
  {
    q: "Do you cover warranty claims?",
    a: "Every product carries a 2-year manufacturer warranty plus ShipNest's own protection on shipping damages.",
  },
];

const HomeFAQ = () => {
  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="max-w-3xl mx-auto px-4">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-[12px] text-primary font-medium uppercase tracking-wider mb-2">Answers</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Frequently asked.
            </h2>
          </div>
        </Reveal>
        <div className="border-t border-border">
          {faqs.map((f, i) => (
            <details key={i} className="border-b border-border group">
              <summary className="flex items-center justify-between py-5 cursor-pointer list-none hover:opacity-75 transition-opacity">
                <span className="text-[15px] font-semibold text-foreground pr-4">{f.q}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180 shrink-0" />
              </summary>
              <p className="pb-5 text-[14px] text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFAQ;