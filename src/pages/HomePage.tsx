import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, Truck, RotateCcw, ShieldCheck, Sparkles, Plane, ArrowRight, Star, Globe, Box, CheckCircle2 } from "lucide-react";
import { homepageProducts } from "@/data/homepageData";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { useWishlist } from "@/hooks/useWishlist";
import { useOrders } from "@/context/OrderContext";
import { getProductStageTheme } from "@/lib/productPresentation";
import { toast } from "sonner";
import Reveal from "@/components/Reveal";
import CategoryTiles from "@/components/CategoryTiles";
import LiveStats from "@/components/LiveStats";
import DeliveryEstimator from "@/components/home/DeliveryEstimator";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import HomeFAQ from "@/components/home/HomeFAQ";

const sampleTrackingIds = ["SNX7829104", "SNX4920183", "SNX6104829"];

const tabLinks: Record<string, { url: string; label: string }> = {
  flagships: { url: "/shop?department=Technology", label: "Flagships" },
  apple: { url: "/shop?brand=Apple", label: "Apple Products" },
  luxury: { url: "/shop?department=Designer+Fashion+%26+Accessories", label: "Luxury Goods" },
  watches: { url: "/shop?department=Watches+%26+Jewellery", label: "Timepieces" },
  samsung: { url: "/shop?brand=Samsung", label: "Samsung Products" },
};

const HomePage = () => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { getOrder } = useOrders();
  const navigate = useNavigate();
  const [trackInput, setTrackInput] = useState("");
  const [activeTab, setActiveTab] = useState<"flagships" | "apple" | "luxury" | "samsung" | "watches">("flagships");

  // Flagship Hero Products
  const heroProduct = homepageProducts.find(p => p.id === "iphone-18-pro-max") || homepageProducts[0];
  const heroStageTheme = useMemo(() => getProductStageTheme(heroProduct), [heroProduct]);
  const secondaryHero = homepageProducts.find(p => p.id === "iphone-duo") || homepageProducts.find(p => p.id === "galaxy-s26-ultra") || homepageProducts[3];

  // Curated Collections — 6 products initially per section as requested
  const flagships = homepageProducts.filter(p => p.department === "Technology" && (p.badge === "NEW" || p.badge === "PRO" || p.badge === "HOT")).slice(0, 6);
  const appleProducts = homepageProducts.filter(p => p.brand === "Apple").slice(0, 6);
  const luxuryHighlightsList = homepageProducts.filter(p => p.department !== "Technology").slice(0, 6);
  const samsungProducts = homepageProducts.filter(p => p.brand === "Samsung").slice(0, 6);
  const watchProducts = homepageProducts.filter(p => p.department === "Watches & Jewellery" || p.category === "Watch").slice(0, 6);

  const displayedProducts = 
    activeTab === "apple" ? appleProducts :
    activeTab === "luxury" ? luxuryHighlightsList :
    activeTab === "samsung" ? samsungProducts :
    activeTab === "watches" ? watchProducts : flagships;

  const handleTrack = (customId?: string) => {
    const idToSearch = (customId || trackInput).trim();
    if (!idToSearch) {
      toast.error("Please enter a tracking or order ID");
      return;
    }
    navigate(`/track/${idToSearch}`);
  };

  return (
    <div className="bg-background text-foreground">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border bg-[#fafafc]">
        {/* Subtle radial ambient background glow (restrained neutral) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none blur-3xl" />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 lg:pb-20 relative">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Editorial Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[12px] font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prague Central Hub · Worldwide Express Dispatch</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-bold text-foreground tracking-tight leading-[1.04]">
                The world’s best tech.<br />
                <span className="text-muted-foreground font-normal">Delivered globally.</span>
              </h1>

              <p className="text-[16px] sm:text-[18px] text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Authentic, sealed flagship electronics from Apple, Samsung, Google, and Sony. Dispatched direct from our European logistics hub to 60+ countries with live milestone tracking.
              </p>

              {/* Primary Call to Actions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/shop"
                  className="bg-foreground text-background px-7 py-3.5 rounded-full text-[14px] font-semibold hover:bg-foreground/85 transition-all shadow-sm active:scale-98"
                >
                  Explore Collection
                </Link>
                <Link
                  to={`/product/${heroProduct.id}`}
                  className="bg-background border border-border px-6 py-3.5 rounded-full text-[14px] font-medium hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
                >
                  View {heroProduct.name} <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>

              {/* Instant Tracking Widget in Hero */}
              <div className="pt-4 max-w-lg mx-auto lg:mx-0">
                <div className="bg-background border border-border rounded-2xl p-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0 ml-1.5" />
                    <input
                      type="text"
                      placeholder="Have a tracking number? e.g. SNX7829104"
                      value={trackInput}
                      onChange={e => setTrackInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleTrack()}
                      className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button
                      onClick={() => handleTrack()}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-[12px] font-semibold hover:bg-primary/90 transition-colors shrink-0"
                    >
                      Track
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground px-1">
                    <span>Recent shipments:</span>
                    {sampleTrackingIds.map(sample => (
                      <button
                        key={sample}
                        onClick={() => handleTrack(sample)}
                        className="font-mono text-primary hover:underline"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Trust Micro Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-2 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground/85">
                  <Plane className="w-3.5 h-3.5 text-primary" /> Free Express Worldwide
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground/85">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 2-Year Full EU Warranty
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground/85">
                  <RotateCcw className="w-3.5 h-3.5 text-primary" /> 30-Day Money Back
                </span>
              </div>
            </div>

            {/* Right Column: Hero Hardware Showcase */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Main Card */}
                <Link
                  to={`/product/${heroProduct.id}`}
                  className="group block bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-foreground/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        Flagship of the Year
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1 tracking-tight">
                        {heroProduct.name}
                      </h2>
                      <p className="text-[13px] text-muted-foreground mt-0.5">
                        {heroProduct.specs[0]}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-[12px] font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{heroProduct.rating}</span>
                    </div>
                  </div>

                  {/* High Res Product Visual Stage */}
                  <div className="aspect-[4/3] sm:aspect-square flex items-center justify-center my-6 overflow-hidden rounded-2xl p-4 border border-border/40 transition-all duration-300" style={{ background: heroStageTheme.background }}>
                    <img
                      src={heroProduct.image}
                      alt={heroProduct.name}
                      className="max-h-[300px] sm:max-h-[340px] w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <div>
                      <span className="text-[12px] text-muted-foreground block">Starting at</span>
                      <span className="text-[20px] font-bold text-foreground tabular-nums">${heroProduct.price}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Explore Device <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>

                {/* Secondary Pill Highlight */}
                {secondaryHero && (
                  <Link
                    to={`/product/${secondaryHero.id}`}
                    className="mt-4 hidden sm:flex items-center justify-between p-3.5 bg-card border border-border/80 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-foreground/20 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center p-1 overflow-hidden">
                        <img src={secondaryHero.image} alt={secondaryHero.name} className="h-full w-auto object-contain" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Also New</p>
                        <p className="text-[14px] font-semibold text-foreground group-hover:text-primary transition-colors">{secondaryHero.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-semibold text-foreground">${secondaryHero.price}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUTHORIZED BRAND RAIL */}
      <section className="border-b border-border py-8 bg-secondary/20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground shrink-0">
              Authorized European Retailer
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-8 gap-y-3">
              {[
                { name: "Apple", to: "/shop?brand=Apple" },
                { name: "Samsung", to: "/shop?brand=Samsung" },
                { name: "Google Pixel", to: "/shop?brand=Google" },
                { name: "Sony", to: "/shop?brand=Sony" },
                { name: "OnePlus", to: "/shop?brand=OnePlus" },
                { name: "Nothing", to: "/shop?brand=Nothing" },
              ].map(b => (
                <Link
                  key={b.name}
                  to={b.to}
                  className="text-[15px] sm:text-[16px] font-semibold text-muted-foreground/80 hover:text-foreground transition-colors tracking-tight"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE LOGISTICS & PRAGUE HUB SHOWCASE */}
      <section className="py-16 sm:py-20 border-b border-border bg-background">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Visual Logistics Card */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="bg-[#18181b] text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[12px] font-mono tracking-wider uppercase text-white/80">
                      Prague Global Air Dispatch · Active
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-white/60">SN-HUB-01</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">Central European Fulfillment</p>
                      <p className="text-[12px] text-white/60 mt-0.5 leading-relaxed">
                        Orders packaged in tamper-evident security cartons at Prague Airport Logistics Park (PRG).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">Direct Air Cargo Routing</p>
                      <p className="text-[12px] text-white/60 mt-0.5 leading-relaxed">
                        Daily air cargo flights connect to London Heathrow, Istanbul, Beijing, and Mumbai international hubs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">Cryptographic Delivery PIN Verification</p>
                      <p className="text-[12px] text-white/60 mt-0.5 leading-relaxed">
                        Handed to the recipient only upon 4-digit security PIN verification at the doorstep.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[12px]">
                  <span className="text-white/60">Average Global Transit</span>
                  <span className="font-mono text-white font-semibold">3–9 Business Days</span>
                </div>
              </div>
            </div>

            {/* Editorial Copy */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Signature Logistics Infrastructure
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
                Why international tech shopping with ShipNest feels effortless.
              </h2>
              <p className="text-[15px] sm:text-[16px] text-muted-foreground leading-relaxed">
                Most international electronics shopping suffers from uncertain transit times, damaged parcels, and grey-market inventory. ShipNest operates as a certified Czech electronics house with direct air-freight logistics.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/track"
                  className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-[13px] font-semibold hover:bg-foreground/85 transition-colors"
                >
                  <Search className="w-4 h-4" /> Try Shipment Tracker
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-full text-[13px] font-medium hover:bg-secondary/70 transition-colors"
                >
                  Our Prague Facility →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURATED PRODUCT COLLECTIONS WITH TAB SWITCHER */}
      <section className="py-16 sm:py-20 border-b border-border bg-background">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Curated Flagships.
              </h2>
              <p className="text-[15px] text-muted-foreground mt-1.5">
                Every unit in our warehouse is brand new, sealed, and backed by a 2-year warranty.
              </p>
            </div>

            {/* Category Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-secondary rounded-full w-fit">
              {[
                { id: "flagships", label: "Flagships" },
                { id: "apple", label: "Apple" },
                { id: "luxury", label: "Luxury Goods" },
                { id: "watches", label: "Timepieces" },
                { id: "samsung", label: "Samsung" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product, idx) => (
              <Reveal key={product.id} delay={idx * 60}>
                <ProductCard
                  product={product}
                  isWishlisted={isWishlisted(product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              </Reveal>
            ))}
          </div>

          {/* Minimal View More & Complete Store Navigation */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to={tabLinks[activeTab].url}
              className="inline-flex items-center gap-2 bg-background border border-border hover:bg-secondary text-foreground px-6 py-3 rounded-full font-medium text-[13px] transition-all shadow-xs"
            >
              <span>View More {tabLinks[activeTab].label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/85 px-7 py-3 rounded-full font-semibold text-[13px] transition-colors"
            >
              <span>Explore Complete 665-Item Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SHOP BY HARDWARE CATEGORY */}
      <section className="py-16 sm:py-20 border-b border-border bg-[#fafafc]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Explore Categories</h2>
            <p className="text-[15px] text-muted-foreground">Find the exact tier of technology you need.</p>
          </div>

          <CategoryTiles />
        </div>
      </section>

      {/* 6. REAL-TIME STATS & LOGISTICS ACTIVITY */}
      <section className="py-14 border-b border-border bg-background">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <LiveStats />
        </div>
      </section>

      {/* 7. DELIVERY ESTIMATOR & GLOBAL TIMELINES */}
      <section className="py-16 sm:py-20 border-b border-border bg-[#fafafc]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Transit Estimator</h2>
            <p className="text-[15px] text-muted-foreground">Check instant delivery windows and courier assignments for your location.</p>
          </div>
          <DeliveryEstimator />
        </div>
      </section>

      {/* 8. VERIFIED CUSTOMER REVIEWS */}
      <section className="py-16 sm:py-20 border-b border-border bg-background">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-1.5 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[13px] font-bold text-foreground ml-1.5">4.9 / 5 Overall Score</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Discerning buyers worldwide.
              </h2>
            </div>
            <p className="text-[14px] text-muted-foreground">Verified buyer testimonials from 140,000+ dispatches</p>
          </div>

          <ReviewsCarousel />
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 sm:py-20 bg-[#fafafc]">
        <div className="max-w-[840px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Frequently Asked Questions</h2>
            <p className="text-[15px] text-muted-foreground">Straight answers on authenticity, warranties, and international customs.</p>
          </div>

          <HomeFAQ />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
