import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, Truck, RotateCcw, CreditCard, Headphones, Plane, Shield, Sparkles } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";
import PaymentIcons from "@/components/PaymentIcons";
import PressStrip from "@/components/PressStrip";
import Reveal from "@/components/Reveal";
import CategoryTiles from "@/components/CategoryTiles";
import TrustPillars from "@/components/TrustPillars";
import LiveStats from "@/components/LiveStats";
import RecentDeliveries from "@/components/RecentDeliveries";
import ActivityFeed from "@/components/ActivityFeed";
import DeliveryEstimator from "@/components/home/DeliveryEstimator";
import HowItWorks from "@/components/home/HowItWorks";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import HomeFAQ from "@/components/home/HomeFAQ";

const HomePage = () => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { getOrder } = useOrders();
  const navigate = useNavigate();
  const [trackInput, setTrackInput] = useState("");

  // Hero featured products
  const heroProduct = products.find(p => p.id === "iphone-17-pro-max") || products[0];
  const tile1 = products.find(p => p.id === "iphone-17-pro") || products.find(p => p.brand === "Apple");
  const tile2 = products.find(p => p.brand === "Samsung");

  const featured = products.filter(p => p.badge === "HOT" || p.badge === "ELITE" || p.badge === "BEST").slice(0, 4);
  const iphone17 = products.filter(p => p.category === "iPhone 17").slice(0, 4);
  const samsung = products.filter(p => p.brand === "Samsung").slice(0, 4);
  const pixel = products.filter(p => p.brand === "Google").slice(0, 4);
  const audio = products.filter(p => p.category === "Audio").slice(0, 4);

  const handleTrack = () => {
    if (!trackInput.trim()) return;
    const order = getOrder(trackInput.trim());
    if (order) navigate(`/track/${order.trackingId}`);
    else toast.error("No order found with that ID");
  };

  const Section = ({ title, subtitle, items, link }: { title: string; subtitle?: string; items: typeof products; link: string }) => (
    <section className="py-10">
      <div className="max-w-[980px] mx-auto px-4">
        <Reveal>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">{title}</h2>
            {subtitle && <p className="text-[14px] text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Link to={link} className="text-[14px] text-primary hover:opacity-75 transition-opacity flex items-center gap-1 font-normal">
            Shop all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );

  const HeroTile = ({ product, eyebrow }: { product: typeof products[0]; eyebrow?: string }) => {
    return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col items-center text-center pt-12 px-6 min-h-[560px] transition-all duration-300 hover:shadow-xl group">
      {eyebrow && <p className="text-[12px] text-primary font-medium uppercase tracking-wider mb-2">{eyebrow}</p>}
      <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">{product.name}</h3>
      <p className="text-[16px] text-muted-foreground mt-2 max-w-xs">{product.specs[0]}</p>
      <div className="flex items-center gap-5 mt-4">
        <Link to={`/product/${product.id}`} className="text-primary text-[15px] hover:opacity-75 transition-opacity">Learn more <ChevronRight className="inline w-4 h-4" /></Link>
        <Link to={`/product/${product.id}`} className="text-primary text-[15px] hover:opacity-75 transition-opacity">Buy <ChevronRight className="inline w-4 h-4" /></Link>
      </div>
      <div className="flex-1 flex items-center justify-center mt-6 w-full overflow-hidden rounded-xl bg-background p-3">
        <img src={product.image} alt={product.name} className="max-h-[340px] max-w-full w-auto h-auto object-contain transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
    </div>
  );
  };

  return (
    <div className="bg-background">
      {/* HERO — Apple-style full-bleed */}
      <section className="bg-background">
        <div className="max-w-[980px] mx-auto px-4 pt-14 pb-12 text-center">
          <p className="text-[12px] text-primary font-medium uppercase tracking-wider mb-2 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> New · Ships worldwide
          </p>
          <h1 className="display text-5xl sm:text-6xl md:text-7xl text-foreground">{heroProduct.name}</h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mt-3 font-normal">Forged aluminum. A19 Pro. Pro Fusion camera.</p>
          <div className="flex items-center justify-center gap-6 mt-5">
            <Link to={`/product/${heroProduct.id}`} className="text-primary text-[17px] hover:opacity-75 transition-opacity">Learn more <ChevronRight className="inline w-5 h-5" /></Link>
            <Link to={`/product/${heroProduct.id}`} className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-[15px] font-medium hover:bg-primary/90 transition-colors">Buy</Link>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Plane className="w-3 h-3" /> Express worldwide</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> 2-year warranty</span>
            <span className="flex items-center gap-1.5"><RotateCcw className="w-3 h-3" /> 30-day returns</span>
          </div>
          <div className="mt-10 flex justify-center items-center overflow-hidden h-[390px] sm:h-[540px] bg-background border border-border rounded-2xl p-4 animate-fade-in">
            <img src={heroProduct.image} alt={heroProduct.name} className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-700 hover:scale-[1.03]" />
          </div>
        </div>
      </section>

      {/* 2-up tile grid */}
      {tile1 && tile2 && (
        <section className="bg-background pb-3">
          <div className="max-w-[980px] mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-3">
              <Reveal><HeroTile product={tile1} eyebrow="New" /></Reveal>
              <Reveal delay={150}><HeroTile product={tile2} eyebrow="Galaxy AI" /></Reveal>
            </div>
          </div>
        </section>
      )}

      {/* Press strip */}
      <PressStrip />

      {/* How it works */}
      <HowItWorks />

      {/* Live stats */}
      <LiveStats />

      {/* Delivery estimator (pincode → city/state/country) */}
      <DeliveryEstimator />

      {/* Shop by category */}
      <CategoryTiles />

      {/* Why shop with ShipNest */}
      <TrustPillars />

      {/* Brand strip */}
      <section className="border-y border-border py-8 bg-secondary/30">
        <div className="max-w-[980px] mx-auto px-4">
          <p className="text-center text-[12px] text-muted-foreground uppercase tracking-wider mb-5 font-medium">Authorized retailer of</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {["Apple", "Samsung", "Google", "Xiaomi", "OnePlus", "Sony", "Nothing", "Garmin"].map(b => (
              <Link key={b} to={`/shop?brand=${b}`} className="text-[18px] sm:text-[20px] font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-tight">
                {b}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product sections */}
      <Section title="The latest." subtitle="Take a look at what's new, right now." items={featured} link="/shop" />
      <div className="border-t border-border" />
      <Section title="iPhone 17." subtitle="The latest from Apple." items={iphone17} link="/shop?category=iPhone+17" />
      <div className="border-t border-border" />
      <Section title="Galaxy." subtitle="Innovation meets design." items={samsung} link="/shop?brand=Samsung" />
      <div className="border-t border-border" />
      <Section title="Pixel." subtitle="The phone built by Google." items={pixel} link="/shop?brand=Google" />
      {audio.length > 0 && (
        <>
          <div className="border-t border-border" />
          <Section title="Audio." subtitle="Sound that moves you." items={audio} link="/shop?category=Audio" />
        </>
      )}

      {/* Recent deliveries */}
      <RecentDeliveries />

      {/* Reviews carousel */}
      <ReviewsCarousel />

      {/* FAQ */}
      <HomeFAQ />

      {/* Activity feed */}
      <ActivityFeed />

      {/* Tracking — Apple style */}
      <section className="border-t border-border bg-secondary py-16">
        <div className="max-w-[680px] mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Already ordered?</h2>
          <p className="text-[16px] text-muted-foreground mt-2">Enter your tracking or order ID to check shipment status.</p>
          <div className="flex gap-2 max-w-md mx-auto mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="e.g. SNX4829371"
                value={trackInput} onChange={e => setTrackInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleTrack()}
                className="w-full bg-background border border-border rounded-full pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 text-[14px]" />
            </div>
            <button onClick={handleTrack} className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium text-[14px] hover:bg-primary/90 transition-colors whitespace-nowrap">
              Track
            </button>
          </div>
        </div>
      </section>

      {/* 4-up trust grid — Apple footer style */}
      <section className="border-t border-border py-16 bg-background">
        <div className="max-w-[980px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Truck, title: "Free delivery", body: "Get free shipping on every order, every day." },
              { icon: RotateCcw, title: "Free returns", body: "30-day return window on all products." },
              { icon: CreditCard, title: "Pay over time, your way", body: "Spread payments across 12 months." },
              { icon: Headphones, title: "Get help buying", body: "Chat with a Specialist or call us anytime." },
            ].map(t => (
              <div key={t.title} className="space-y-2">
                <t.icon className="w-7 h-7 mx-auto text-foreground" strokeWidth={1.5} />
                <h3 className="text-[15px] font-semibold text-foreground">{t.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary">
        <div className="max-w-[980px] mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[12px]">
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-[12px]">Shop and Learn</h4>
              <div className="space-y-2">
                <Link to="/shop?category=iPhone+17" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">iPhone</Link>
                <Link to="/shop?brand=Samsung" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Galaxy</Link>
                <Link to="/shop?brand=Google" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Pixel</Link>
                <Link to="/shop?category=Mac" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Mac</Link>
                <Link to="/shop?category=Audio" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Audio</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-[12px]">Account</h4>
              <div className="space-y-2">
                <Link to="/auth" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Sign in / Sign up</Link>
                <Link to="/account" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">My Account</Link>
                <Link to="/wishlist" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Wishlist</Link>
                <Link to="/track" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Order Status</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-[12px]">ShipNest Support</h4>
              <div className="space-y-2">
                <Link to="/contact" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Contact Us</Link>
                <Link to="/returns" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Returns & Refunds</Link>
                <Link to="/track" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Track Order</Link>
                <Link to="/about" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">About Us</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-[12px]">About ShipNest</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Our Story</Link>
                <Link to="/privacy" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block text-muted-foreground hover:text-foreground hover:underline transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
            <p>Copyright © {new Date().getFullYear()} ShipNest s.r.o. · Prague, Czech Republic · IČO: 12345678</p>
            <PaymentIcons />
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">* Monthly pricing is for example only; actual financing terms may vary.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
