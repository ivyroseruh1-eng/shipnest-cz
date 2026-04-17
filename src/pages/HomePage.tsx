import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Zap, Star, ChevronRight, Shield, Truck, RotateCcw, BadgeCheck, Globe, Headphones } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";
import PaymentIcons from "@/components/PaymentIcons";

const stats = [
  { value: "2.4M+", label: "Orders Shipped" },
  { value: "98.7%", label: "On-Time Delivery" },
  { value: "180+", label: "Countries Served" },
  { value: "4.9★", label: "Customer Rating" },
];

const trustBadges = [
  { icon: Shield, label: "Secure Checkout" },
  { icon: Truck, label: "Free Worldwide Shipping" },
  { icon: RotateCcw, label: "30-Day Returns" },
  { icon: BadgeCheck, label: "100% Authentic" },
  { icon: Globe, label: "Ships from Czech Republic" },
  { icon: Headphones, label: "24/7 Support" },
];

const HomePage = () => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { getOrder } = useOrders();
  const navigate = useNavigate();
  const [trackInput, setTrackInput] = useState("");

  const featured = products.filter(p => p.badge === "HOT" || p.badge === "ELITE" || p.badge === "BEST").slice(0, 4);
  const iphone17 = products.filter(p => p.category === "iPhone 17").slice(0, 4);
  const iphone16 = products.filter(p => p.category === "iPhone 16").slice(0, 4);
  const samsung = products.filter(p => p.brand === "Samsung").slice(0, 4);
  const premiumTech = products.filter(p => ["Sony", "DJI", "Bose", "LG", "Garmin"].includes(p.brand)).slice(0, 4);

  const handleTrack = () => {
    if (!trackInput.trim()) return;
    const order = getOrder(trackInput.trim());
    if (order) {
      navigate(`/track/${order.trackingId}`);
    } else {
      toast.error("No order found with that ID");
    }
  };

  const Section = ({ title, subtitle, items, link }: { title: string; subtitle?: string; items: typeof products; link: string }) => (
    <section>
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground tracking-tight">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-2 tracking-[0.2em] uppercase">{subtitle}</p>}
        </div>
        <Link to={link} className="text-[11px] text-primary hover:opacity-80 transition-opacity flex items-center gap-1.5 font-semibold tracking-[0.15em] uppercase border-b border-primary/40 hover:border-primary pb-1">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
        {items.map(p => <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />)}
      </div>
    </section>
  );

  return (
    <div className="pb-20">
      {/* Hero — Dark Luxury */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-24 sm:py-36 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-[11px] text-primary font-medium mb-8 tracking-[0.2em] uppercase">
            <Zap className="w-3 h-3" /> iPhone 17 · Now Available
          </div>
          <h1 className="font-serif-display text-5xl sm:text-7xl md:text-8xl font-medium tracking-tight leading-[0.95] text-foreground max-w-5xl mx-auto">
            Premium Tech.
            <br />
            <span className="gold-text italic">Delivered Worldwide.</span>
          </h1>
          <p className="text-[15px] sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mt-8 font-light">
            Authentic products handpicked and shipped from Prague, Czech Republic.<br className="hidden sm:block" />
            Concierge logistics across 180+ countries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link to="/shop" className="gold-gradient px-10 py-3.5 rounded-sm font-semibold text-[13px] tracking-[0.15em] uppercase hover:opacity-90 transition-all inline-flex items-center justify-center gap-2 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.5)]">
              Shop Collection <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/shop?category=iPhone+17" className="border border-primary/40 text-foreground px-10 py-3.5 rounded-sm font-semibold text-[13px] tracking-[0.15em] uppercase hover:bg-primary/5 hover:border-primary transition-colors inline-flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-primary" /> iPhone 17 Series
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* Trust badges */}
        <section className="py-10 border-b border-border">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {trustBadges.map(b => (
              <div key={b.label} className="flex items-center gap-2">
                <b.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[12px] text-muted-foreground font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{s.value}</p>
              <p className="text-[13px] text-muted-foreground mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Product sections */}
        <div className="space-y-20">
          <Section title="Featured Products" subtitle="Our most popular picks" items={featured} link="/shop" />
          <Section title="iPhone 17 Series" subtitle="The latest from Apple" items={iphone17} link="/shop?category=iPhone+17" />
          <Section title="iPhone 16 Series" subtitle="Incredible value" items={iphone16} link="/shop?category=iPhone+16" />
          <Section title="Samsung Galaxy" subtitle="Innovation meets design" items={samsung} link="/shop?brand=Samsung" />
          <Section title="Premium Tech" subtitle="Audio, gaming & more" items={premiumTech} link="/shop" />
        </div>

        {/* Tracking */}
        <section className="mt-20 bg-secondary/50 rounded-2xl p-8 sm:p-10 border border-border/50">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold text-foreground tracking-tight">Already ordered?</h3>
              <p className="text-[14px] text-muted-foreground">Enter your tracking or order ID to check shipment status.</p>
            </div>
            <div className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="e.g. SNX4829371"
                  value={trackInput} onChange={e => setTrackInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTrack()}
                  className="w-full bg-background border border-border rounded-full pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 text-[14px]" />
              </div>
              <button onClick={handleTrack} className="bg-foreground text-background px-6 py-3 rounded-full font-semibold text-[14px] hover:bg-foreground/90 transition-colors whitespace-nowrap">
                Track
              </button>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <footer className="mt-20 pt-12 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Shop</h4>
              <div className="space-y-2">
                <Link to="/shop?category=iPhone+17" className="block text-muted-foreground hover:text-foreground transition-colors">iPhone 17</Link>
                <Link to="/shop?category=iPhone+16" className="block text-muted-foreground hover:text-foreground transition-colors">iPhone 16</Link>
                <Link to="/shop?brand=Samsung" className="block text-muted-foreground hover:text-foreground transition-colors">Samsung</Link>
                <Link to="/shop?category=Mac" className="block text-muted-foreground hover:text-foreground transition-colors">Mac</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <div className="space-y-2">
                <Link to="/track" className="block text-muted-foreground hover:text-foreground transition-colors">Track Order</Link>
                <Link to="/returns" className="block text-muted-foreground hover:text-foreground transition-colors">Returns & Refunds</Link>
                <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-muted-foreground hover:text-foreground transition-colors">About ShipNest</Link>
                <Link to="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
                <Link to="/returns" className="block text-muted-foreground hover:text-foreground transition-colors">Returns Policy</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-muted-foreground">
            <p>© {new Date().getFullYear()} ShipNest s.r.o. · Prague, Czech Republic · IČO: 12345678</p>
            <PaymentIcons />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
