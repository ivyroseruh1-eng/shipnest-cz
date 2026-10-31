import { Link } from "react-router-dom";
import { ShieldCheck, Plane, RotateCcw, Award, Globe, ArrowRight } from "lucide-react";
import Logo from "@/components/brand/Logo";
import PaymentIcons from "@/components/PaymentIcons";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-[#fafafc] text-foreground transition-colors print:hidden">
      {/* Trust Pillars */}
      <div className="border-b border-border/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-foreground tracking-tight">100% Authentic & Sealed</h4>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  Sourced straight from authorized distributors. Original manufacturer packaging with verifiable serials.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Plane className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-foreground tracking-tight">Worldwide Air Express</h4>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  Dispatched directly from our Prague central hub to over 60 countries with end-to-end milestone tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Award className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-foreground tracking-tight">2-Year Full Warranty</h4>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  Every product is backed by a 2-year warranty and dedicated European technical support desk.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <RotateCcw className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-foreground tracking-tight">30-Day Hassle-Free Returns</h4>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  EU Directive 2011/83/EU compliant return policy. Return labels and fast refund processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4 pr-0 md:pr-6">
            <Logo variant="full" size={32} />
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-sm">
              ShipNest is a premier international electronics retailer and smart logistics provider based in Prague, Czech Republic. We deliver sealed flagship hardware globally with guaranteed authentic provenance.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[12px] text-muted-foreground">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Prague Central Hub · Dispatching to 60+ countries</span>
            </div>
          </div>

          {/* Navigation Column 1 */}
          <div>
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80 mb-4">Shop</h5>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link to="/shop?category=iPhone+17" className="text-muted-foreground hover:text-foreground transition-colors">iPhone 17 Series</Link></li>
              <li><Link to="/shop?category=iPhone+18" className="text-muted-foreground hover:text-foreground transition-colors">iPhone 18 Flagships</Link></li>
              <li><Link to="/shop?brand=Samsung" className="text-muted-foreground hover:text-foreground transition-colors">Samsung Galaxy</Link></li>
              <li><Link to="/shop?brand=Google" className="text-muted-foreground hover:text-foreground transition-colors">Google Pixel</Link></li>
              <li><Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">All Devices</Link></li>
              <li><Link to="/compare" className="text-muted-foreground hover:text-foreground transition-colors">Compare Models</Link></li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div>
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80 mb-4">Logistics</h5>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link to="/track" className="text-muted-foreground hover:text-foreground transition-colors">Track Shipment</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">Prague Fulfillment Hub</Link></li>
              <li><Link to="/returns" className="text-muted-foreground hover:text-foreground transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Customs & Clearance</Link></li>
              <li><Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Operations Portal</Link></li>
            </ul>
          </div>

          {/* Navigation Column 3 */}
          <div>
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80 mb-4">Company</h5>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About ShipNest</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/returns" className="text-muted-foreground hover:text-foreground transition-colors">Consumer Rights (EU)</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Payment Row */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-muted-foreground">
          <div className="space-y-1 text-center md:text-left">
            <p>© {new Date().getFullYear()} ShipNest s.r.o. All rights reserved.</p>
            <p className="text-[11px] text-muted-foreground/80">
              Registered in the Commercial Register at the Municipal Court in Prague, Czech Republic · Reg. No. 14289201.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PaymentIcons />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
