import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Zap, Star, ChevronRight, Shield, Truck, RotateCcw, BadgeCheck, Globe, Headphones } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";

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
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{title}</h2>
          {subtitle && <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <Link to={link} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-medium">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
        {items.map(p => <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />)}
      </div>
      <div className="text-center mt-8">
        <Link to={link} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors border border-border rounded-full px-6 py-2.5 hover:border-foreground/30 font-medium">
          View more <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-[12px] text-foreground font-medium mb-6">
            <Zap className="w-3 h-3" /> New iPhone 17 Series Now Available
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-foreground max-w-4xl mx-auto">
            Premium Tech.
            <br />
            <span className="text-muted-foreground">Delivered Worldwide.</span>
          </h1>
          <p className="text-[15px] sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mt-6">
            Authentic products shipped from Prague, Czech Republic. Smart logistics & fulfillment for 180+ countries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/shop" className="bg-foreground text-background px-8 py-3.5 rounded-full font-semibold text-[14px] hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-2">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/shop?category=iPhone+17" className="border border-foreground/20 text-foreground px-8 py-3.5 rounded-full font-semibold text-[14px] hover:bg-foreground/5 transition-colors inline-flex items-center justify-center gap-2">
              <Star className="w-4 h-4" /> iPhone 17 Series
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
                <span className="block text-muted-foreground">Returns & Refunds</span>
                <span className="block text-muted-foreground">Warranty Info</span>
                <span className="block text-muted-foreground">Contact Us</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <div className="space-y-2">
                <span className="block text-muted-foreground">About ShipNest</span>
                <span className="block text-muted-foreground">Careers</span>
                <span className="block text-muted-foreground">Press</span>
                <span className="block text-muted-foreground">Blog</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <div className="space-y-2">
                <span className="block text-muted-foreground">Privacy Policy</span>
                <span className="block text-muted-foreground">Terms of Service</span>
                <span className="block text-muted-foreground">Cookie Policy</span>
                <span className="block text-muted-foreground">GDPR</span>
              </div>
            </div>
          </div>
          <div className="mt-10 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-muted-foreground">
            <p>© {new Date().getFullYear()} ShipNest s.r.o. · Prague, Czech Republic · IČO: 12345678</p>
            <div className="flex items-center gap-4">
              <span className="font-medium tracking-wider">VISA</span>
              <span className="font-medium tracking-wider">MASTERCARD</span>
              <span className="font-medium tracking-wider">AMEX</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
