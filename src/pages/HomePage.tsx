import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Shield, Zap, Star, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import TrustBadges from "@/components/TrustBadges";
import { useWishlist } from "@/hooks/useWishlist";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";

const stats = [
  { value: "2.4M+", label: "Orders Shipped" },
  { value: "98.7%", label: "On-Time Delivery" },
  { value: "220+", label: "Countries Served" },
  { value: "4.9★", label: "Customer Rating" },
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

  const Section = ({ title, items, link }: { title: string; items: typeof products; link: string }) => (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-foreground">{title}</h2>
        <Link to={link} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map(p => <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />)}
      </div>
      <div className="text-center">
        <Link to={link} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors border border-border rounded-lg px-5 py-2 hover:border-primary/50">
          View more products <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Hero */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-2">
            <Zap className="w-3 h-3" /> New iPhone 17 Series Now Available
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black font-orbitron leading-tight">
            <span className="gold-text">Premium Tech</span>
            <br />
            <span className="text-foreground">Delivered Worldwide</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Authentic products shipped from Prague, Czech Republic. Smart logistics & fulfillment for 220+ countries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/shop" className="gold-gradient text-primary-foreground px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/shop?category=iPhone+17" className="border border-border text-foreground px-8 py-3 rounded-xl font-bold text-sm hover:bg-muted transition-colors inline-flex items-center justify-center gap-2">
              <Star className="w-4 h-4" /> iPhone 17 Series
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-12 sm:space-y-16">
        <TrustBadges />

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="text-center p-4 sm:p-6 bg-card border border-border rounded-xl">
              <p className="text-xl sm:text-2xl md:text-3xl font-black font-orbitron gold-text">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </section>

        <Section title="Featured Products" items={featured} link="/shop" />
        <Section title="iPhone 17 Series" items={iphone17} link="/shop?category=iPhone+17" />
        <Section title="iPhone 16 Series" items={iphone16} link="/shop?category=iPhone+16" />
        <Section title="Samsung Galaxy" items={samsung} link="/shop?brand=Samsung" />
        <Section title="Premium Tech" items={premiumTech} link="/shop" />

        {/* Tracking */}
        <section className="bg-card/50 border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold font-orbitron text-foreground">Already ordered?</h3>
              <p className="text-sm text-muted-foreground">Enter your tracking or order ID to check shipment status.</p>
            </div>
            <div className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="e.g. SNX4829371"
                  value={trackInput} onChange={e => setTrackInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTrack()}
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
              </div>
              <button onClick={handleTrack} className="gold-gradient text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
                Track
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
