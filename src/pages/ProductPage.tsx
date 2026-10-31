import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Check, Truck, Shield, RotateCcw, Star, ChevronRight, Cpu, Camera, Battery, Sparkles, Box, Share2, HelpCircle, ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/ProductCard";
import { getProductReviews } from "@/data/reviews";
import Reveal from "@/components/Reveal";
import { toast } from "sonner";

const ProductPage = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "shipping" | "reviews">("specs");
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Device Not Found</h1>
        <p className="text-[14px] text-muted-foreground">The product you're looking for is either discontinued or out of catalog.</p>
        <Link to="/shop" className="inline-block bg-foreground text-background px-6 py-2.5 rounded-full text-[13px] font-semibold">
          Return to Store
        </Link>
      </div>
    );
  }

  const savings = product.originalPrice - product.price;
  const monthly = (product.price / 12).toFixed(2);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const reviews = getProductReviews(product.id);
  const selectedVariant = product.colors?.[selectedColor];
  const selectedImage = selectedVariant?.image || product.image;
  const wish = isWishlisted(product.id);

  const handleAddToCart = () => {
    const itemToAdd = selectedVariant
      ? { ...product, image: selectedImage, name: `${product.name} (${selectedVariant.name})` }
      : product;
    addToCart(itemToAdd, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    const itemToAdd = selectedVariant
      ? { ...product, image: selectedImage, name: `${product.name} (${selectedVariant.name})` }
      : product;
    addToCart(itemToAdd, 1);
    navigate("/checkout");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on ShipNest`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  // Structured Specs
  const parsedSpecs = [
    { label: "Display", value: product.specs[0] || "High-resolution OLED / Retina" },
    { label: "Processor", value: product.specs.find(s => /chip|snapdragon|tensor|exynos|dimensity|m\d/i.test(s)) || "Next-Gen Mobile Architecture" },
    { label: "Camera System", value: product.specs.find(s => /camera|fusion|telephoto|mp/i.test(s)) || "Pro Camera Sensor Array" },
    { label: "Chassis & Build", value: product.specs.find(s => /titanium|aluminum|unibody|ceramic|glass/i.test(s)) || "Aerospace-grade materials" },
    { label: "Storage", value: product.specs.find(s => /storage|tb|gb/i.test(s)) || "High-speed NVMe storage" },
    { label: "Battery & OS", value: product.specs.find(s => /hrs|battery|ios|android/i.test(s)) || "All-day endurance" },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border/70 bg-[#fafafc]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between text-[12px] text-muted-foreground">
          <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link to={`/shop?brand=${product.brand}`} className="hover:text-foreground transition-colors">{product.brand}</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors text-[12px] shrink-0 ml-3"
            aria-label="Share product"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Main Product Stage */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column (7 cols): High-Resolution Image Presentation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#fbfbfd] border border-border rounded-3xl p-8 sm:p-12 flex items-center justify-center aspect-[4/3] sm:aspect-square relative overflow-hidden group">
              {product.badge && (
                <span className="absolute top-6 left-6 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider">
                  {product.badge}
                </span>
              )}

              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-white/90 border border-border shadow-xs hover:scale-105 transition-all"
                aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 ${wish ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>

              {!imgError ? (
                <img
                  key={selectedImage}
                  src={selectedImage}
                  alt={product.name}
                  className="max-h-[380px] sm:max-h-[480px] w-auto object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <span className="text-6xl font-mono text-muted-foreground/30">SN</span>
                  <p className="text-[13px] mt-2 font-medium">{product.name}</p>
                </div>
              )}
            </div>

            {/* Hardware Key Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 text-center">
                <Cpu className="w-5 h-5 mx-auto text-primary mb-1.5" />
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Silicon</p>
                <p className="text-[13px] font-semibold text-foreground mt-0.5 line-clamp-1">
                  {parsedSpecs[1].value.split(' ')[0]} {parsedSpecs[1].value.split(' ')[1] || ""}
                </p>
              </div>

              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 text-center">
                <Sparkles className="w-5 h-5 mx-auto text-primary mb-1.5" />
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Display</p>
                <p className="text-[13px] font-semibold text-foreground mt-0.5 line-clamp-1">
                  {product.specs[0]?.split(',')[0] || "OLED"}
                </p>
              </div>

              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 text-center">
                <Shield className="w-5 h-5 mx-auto text-primary mb-1.5" />
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Warranty</p>
                <p className="text-[13px] font-semibold text-foreground mt-0.5">2-Year Full EU</p>
              </div>

              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 text-center">
                <Truck className="w-5 h-5 mx-auto text-primary mb-1.5" />
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Transit</p>
                <p className="text-[13px] font-semibold text-foreground mt-0.5">Air Express</p>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Purchase Actions & Specifications */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
                {product.brand} · Direct European Import
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-1">
                {product.name}
              </h1>

              {/* Rating & In-stock Indicator */}
              <div className="flex items-center gap-3 mt-3 text-[13px]">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{product.reviews.toLocaleString()} verified reviews</span>
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[12px]">
                  <Check className="w-3.5 h-3.5" /> In Stock
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 bg-secondary/30 border border-border rounded-2xl space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight tabular-nums">
                  ${product.price}
                </span>
                {savings > 0 && (
                  <>
                    <span className="text-[16px] text-muted-foreground line-through tabular-nums">
                      ${product.originalPrice}
                    </span>
                    <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Save ${savings}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground">
                Or approx. ${monthly}/month over 12 months with 0% APR demo financing.
              </p>
            </div>

            {/* Color Variant Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-[13px] font-semibold text-foreground block">
                  Finish: <span className="text-muted-foreground font-normal">{product.colors[selectedColor]?.name}</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color, index) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(index)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-medium transition-all ${
                        selectedColor === index
                          ? "border-foreground bg-secondary/80 font-semibold shadow-xs"
                          : "border-border hover:border-foreground/40 bg-background"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart & Buy Now Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`py-3.5 px-5 rounded-full font-semibold text-[14px] transition-all flex items-center justify-center gap-2 ${
                    added
                      ? "bg-emerald-600 text-white"
                      : "bg-secondary text-foreground hover:bg-secondary/70 border border-border"
                  }`}
                >
                  {added ? <><Check className="w-4 h-4" /> Added to Bag</> : "Add to Bag"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-3.5 px-5 rounded-full bg-foreground text-background font-semibold text-[14px] hover:bg-foreground/85 transition-all shadow-sm active:scale-98"
                >
                  Buy Now
                </button>
              </div>

              <p className="text-[11px] text-center text-muted-foreground">
                Free insured worldwide shipping · Ships within 24 hours from Prague
              </p>
            </div>

            {/* Fulfillment Guarantee Callout */}
            <div className="border border-border rounded-2xl p-4 bg-[#fafafc] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Prague Hub Fulfillment Guarantee</p>
                  <p className="text-[12px] text-muted-foreground">Dispatched in factory-sealed box with manufacturer serials intact.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications & Details Section */}
        <div className="mt-16 sm:mt-24 pt-12 border-t border-border">
          <div className="flex items-center justify-center gap-2 mb-10">
            {[
              { id: "specs", label: "Technical Specifications" },
              { id: "shipping", label: "Shipping & Customs" },
              { id: "reviews", label: `Reviews (${product.reviews})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-full text-[13px] font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "specs" && (
            <div className="max-w-3xl mx-auto divide-y divide-border/70 border border-border rounded-2xl bg-card overflow-hidden">
              {parsedSpecs.map(spec => (
                <div key={spec.label} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold text-foreground w-48">{spec.label}</span>
                  <span className="text-[13px] text-muted-foreground flex-1 sm:text-right">{spec.value}</span>
                </div>
              ))}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 bg-secondary/20">
                <span className="text-[13px] font-semibold text-foreground w-48">In the Box</span>
                <span className="text-[13px] text-muted-foreground flex-1 sm:text-right">
                  {product.name}, USB-C Charging Cable, Documentation, Factory Warranty Card.
                </span>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <h3 className="text-[16px] font-bold text-foreground">Worldwide Express Logistics</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Every order placed on ShipNest is fulfilled directly from our bonded facility in Prague, Czech Republic. Packages are handled under strict custody and handed over to premier international air carriers (DHL Express, FedEx, UPS).
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-3">
                  <div className="p-3 bg-secondary/50 rounded-xl text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Europe & UK</p>
                    <p className="text-[14px] font-bold text-foreground mt-1">2–4 Days</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-xl text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">North America</p>
                    <p className="text-[14px] font-bold text-foreground mt-1">3–5 Days</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-xl text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">APAC & Middle East</p>
                    <p className="text-[14px] font-bold text-foreground mt-1">5–9 Days</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-3xl mx-auto space-y-4">
              {reviews.map(rev => (
                <div key={rev.id} className="bg-card border border-border rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{rev.name}</p>
                      <p className="text-[11px] text-muted-foreground">{rev.location} · Verified Buyer</p>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{rev.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products Carousel/Grid */}
        {related.length > 0 && (
          <div className="mt-20 pt-16 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Related {product.brand} Hardware
              </h2>
              <Link to={`/shop?brand=${product.brand}`} className="text-[13px] text-primary hover:underline font-medium">
                View more →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map(p => (
                <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
