import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Check,
  Truck,
  Shield,
  Star,
  ChevronRight,
  ChevronLeft,
  Cpu,
  Camera,
  Box,
  Share2,
  ZoomIn,
  X,
  MessageSquare,
  Sparkles,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { getProductReviews } from "@/data/reviews";
import { getProductStageTheme } from "@/lib/productPresentation";
import { toast } from "sonner";

const ProductPage = () => {
  const { id } = useParams();
  // Support lookup by slug, draft listing ID (e.g. SNL-0001), or legacy alias
  const product = products.find(
    (p) =>
      p.id === id ||
      (p.draftListingId && p.draftListingId.toLowerCase() === id?.toLowerCase()) ||
      (id === "iphone-17-air" && p.id === "iphone-air")
  );

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "shipping" | "reviews">("specs");
  const [added, setAdded] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  // Gallery array collation (called unconditionally before early returns)
  const selectedVariant = product?.colors?.[selectedColor];
  const stageTheme = useMemo(
    () => getProductStageTheme(product, selectedVariant),
    [product, selectedVariant]
  );
  const galleryList = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (selectedVariant?.image) list.push(selectedVariant.image);
    if (product.image && !list.includes(product.image)) list.push(product.image);
    if (product.gallery) {
      product.gallery.forEach((g) => {
        if (!list.includes(g)) list.push(g);
      });
    }
    return list.length > 0 ? list : [product.image];
  }, [product, selectedVariant]);

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
        <p className="text-[14px] text-muted-foreground">
          The requested model is either archived, discontinued, or pending catalogue publication.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-foreground text-background px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-foreground/85 transition-colors"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  const activeImage = galleryList[activeImageIndex] || galleryList[0] || product.image;

  // Safe pricing calculation (protecting null prices)
  const hasPrice = product.price !== null && product.price !== undefined;
  const savings = hasPrice && product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : null;
  const monthly = hasPrice ? (product.price / 12).toFixed(2) : null;

  const related = products
    .filter((p) => (p.department === product.department || p.category === product.category) && p.id !== product.id)
    .slice(0, 4);

  const reviews = getProductReviews(product.id);
  const wish = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (!hasPrice) {
      setInquirySent(true);
      toast.info("Pricing inquiry recorded. Our concierge team will reach out.");
      return;
    }
    const itemToAdd = selectedVariant
      ? { ...product, image: activeImage, name: `${product.name} (${selectedVariant.name})` }
      : { ...product, image: activeImage };
    addToCart(itemToAdd, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!hasPrice) {
      setInquirySent(true);
      toast.info("Pricing inquiry recorded. Concierge desk notified.");
      return;
    }
    const itemToAdd = selectedVariant
      ? { ...product, image: activeImage, name: `${product.name} (${selectedVariant.name})` }
      : { ...product, image: activeImage };
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

  const nextImage = () => {
    setActiveImageIndex((i) => (i + 1) % galleryList.length);
  };

  const prevImage = () => {
    setActiveImageIndex((i) => (i - 1 + galleryList.length) % galleryList.length);
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* 1. Breadcrumb Navigation (strictly zero horizontal scroll: wrapped layout) */}
      <div className="border-b border-border/70 bg-[#fafafc]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted-foreground">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            {product.department && (
              <>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <Link
                  to={`/shop?department=${encodeURIComponent(product.department)}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.department}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link
              to={`/shop?brand=${encodeURIComponent(product.brand)}`}
              className="hover:text-foreground transition-colors"
            >
              {product.brand}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors text-[12px] shrink-0"
            aria-label="Share product"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Stage */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (7 cols): Full Multi-Angle Gallery Viewer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col-reverse sm:flex-row gap-4 items-start">
              {/* Thumbnail Strip (Vertical on SM+, wrapped grid on Mobile — Zero horizontal scroll) */}
              {galleryList.length > 1 && (
                <div className="flex sm:flex-col gap-2.5 w-full sm:w-20 shrink-0 overflow-x-hidden flex-wrap sm:flex-nowrap">
                  {galleryList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      style={{ background: stageTheme.background }}
                      className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden border p-1.5 transition-all ${
                        activeImageIndex === idx
                          ? "border-foreground ring-2 ring-foreground/20 shadow-xs"
                          : "border-border hover:border-foreground/40 opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`View angle ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Stage Image Viewer */}
              <div
                className="flex-1 w-full border rounded-3xl p-6 sm:p-10 flex items-center justify-center aspect-square relative overflow-hidden group transition-all duration-300 shadow-xs"
                style={{
                  background: stageTheme.background,
                  borderColor: stageTheme.borderColor,
                }}
              >
                {product.badge && (
                  <span className={`absolute top-5 left-5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    product.badge === "LUXURY"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}>
                    {product.badge}
                  </span>
                )}

                <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
                  <button
                    onClick={() => setZoomOpen(true)}
                    className="p-2.5 rounded-full bg-white/90 border border-border shadow-xs hover:scale-105 transition-all text-muted-foreground hover:text-foreground"
                    aria-label="Zoom image"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2.5 rounded-full bg-white/90 border border-border shadow-xs hover:scale-105 transition-all"
                    aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${wish ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                  </button>
                </div>

                {/* Main Image with Cascading Fallback */}
                <div
                  className="max-h-[380px] sm:max-h-[440px] w-full h-full flex items-center justify-center cursor-zoom-in"
                  onClick={() => setZoomOpen(true)}
                >
                  <ProductImage
                    src={activeImage}
                    fallbackImages={product.fallbackImages}
                    alt={product.name}
                    department={product.department}
                    category={product.category}
                    stageTheme={stageTheme}
                    priority={true}
                    loading="eager"
                    width={800}
                    height={800}
                    className="max-h-[380px] sm:max-h-[440px] w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Previous / Next Controls */}
                {galleryList.length > 1 && (
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                      onClick={prevImage}
                      className="pointer-events-auto w-9 h-9 rounded-full bg-white/90 border border-border shadow-sm flex items-center justify-center text-foreground hover:scale-105 transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="pointer-events-auto w-9 h-9 rounded-full bg-white/90 border border-border shadow-sm flex items-center justify-center text-foreground hover:scale-105 transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quality & Fulfillment Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-3.5 text-center">
                <Box className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Provenance</p>
                <p className="text-[12px] font-semibold text-foreground mt-0.5 line-clamp-1">Prague Bonded Hub</p>
              </div>

              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-3.5 text-center">
                <Shield className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Authenticity</p>
                <p className="text-[12px] font-semibold text-foreground mt-0.5 line-clamp-1">100% Genuine</p>
              </div>

              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-3.5 text-center">
                <Truck className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Logistics</p>
                <p className="text-[12px] font-semibold text-foreground mt-0.5 line-clamp-1">Express Air Freight</p>
              </div>

              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-3.5 text-center">
                <Sparkles className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Verification</p>
                <p className="text-[12px] font-semibold text-foreground mt-0.5 line-clamp-1">Doorstep PIN Code</p>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Product Details & Order Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
                  {product.brand}
                </span>
                {product.draftListingId && (
                  <span className="text-[11px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground border border-border">
                    {product.draftListingId}
                  </span>
                )}
                {product.department && (
                  <>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-xs text-muted-foreground">{product.department}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1.5 leading-tight">
                {product.name}
              </h1>

              {/* Status and Reviews Badge */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3 text-[13px]">
                {product.reviews > 0 ? (
                  <>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-foreground">{product.rating}</span>
                    </div>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{product.reviews.toLocaleString()} reviews</span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                    Official European Distribution
                  </span>
                )}
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[12px]">
                  <Check className="w-3.5 h-3.5" />
                  {product.stockStatus || (product.inStock ? "In Stock" : "Available Upon Request")}
                </span>
              </div>
            </div>

            {/* Price Presentation (Gracefully handling unconfirmed luxury prices) */}
            <div className="p-5 bg-secondary/30 border border-border rounded-2xl space-y-1">
              {hasPrice ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight tabular-nums">
                      ${product.price}
                    </span>
                    {savings && savings > 0 && (
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
                  {monthly && (
                    <p className="text-[12px] text-muted-foreground">
                      Or approx. ${monthly}/month over 12 months with flexible installment financing.
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-1">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Price Upon Inquiry
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Sourced directly on request via authorized luxury distributors. Confirmed at private concierge quotation.
                  </p>
                </div>
              )}
            </div>

            {/* Color / Variant Selector (if available) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-[13px] font-semibold text-foreground block">
                  Select Finish: <span className="text-muted-foreground font-normal">{product.colors[selectedColor]?.name}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(index);
                        setActiveImageIndex(0);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-medium transition-all ${
                        selectedColor === index
                          ? "border-foreground bg-secondary/90 font-semibold shadow-xs"
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

            {/* Actions: Add to Cart / Inquiry */}
            <div className="space-y-3 pt-2">
              {hasPrice ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setInquirySent(true);
                      toast.success("Concierge inquiry submitted for " + product.name);
                    }}
                    className={`w-full py-3.5 px-5 rounded-full font-semibold text-[14px] transition-all flex items-center justify-center gap-2 ${
                      inquirySent
                        ? "bg-emerald-600 text-white"
                        : "bg-foreground text-background hover:bg-foreground/85 shadow-sm"
                    }`}
                  >
                    {inquirySent ? (
                      <><Check className="w-4 h-4" /> Sourcing Request Received</>
                    ) : (
                      <><MessageSquare className="w-4 h-4" /> Request Private Sourcing Quote</>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Direct communication with our European luxury concierge desk within 2 business hours.
                  </p>
                </div>
              )}

              <p className="text-[11px] text-center text-muted-foreground">
                Dispatches from Central European Hub in Prague · Worldwide Insured Air Transit
              </p>
            </div>

            {/* Sourcing & Authenticity Callout */}
            <div className="border border-border rounded-2xl p-4 bg-[#fafafc] space-y-2">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">ShipNest Authenticity Promise</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.authenticityEvidence || "Original brand packaging and tamper-evident transit seals verified before departure from Prague."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Specifications, Sourcing & Customer Feedback Tabs */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: "specs", label: "Specifications & Details" },
              { id: "shipping", label: "Logistics & Customs" },
              { id: "reviews", label: `Customer Feedback (${reviews.length})` },
            ].map((tab) => (
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
              {product.specs.map((spec, i) => (
                <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold text-foreground w-48">Feature {i + 1}</span>
                  <span className="text-[13px] text-muted-foreground flex-1 sm:text-right">{spec}</span>
                </div>
              ))}
              {product.variantsToVerify && (
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 bg-secondary/20">
                  <span className="text-[13px] font-semibold text-foreground w-48">Variant Specifications</span>
                  <span className="text-[13px] text-muted-foreground flex-1 sm:text-right">
                    {product.variantsToVerify}
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <h3 className="text-[16px] font-bold text-foreground">Worldwide Express Logistics</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Every order placed on ShipNest is fulfilled directly from our bonded facility in Prague, Czech Republic. Packages are handled under strict custody and handed over to premier international air carriers (DHL Express, FedEx, UPS).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div className="p-3 bg-secondary/50 rounded-xl text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Europe & UK</p>
                    <p className="text-[14px] font-bold text-foreground mt-1">2–4 Days</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-xl text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">North America</p>
                    <p className="text-[14px] font-bold text-foreground mt-1">3–5 Days</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-xl text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">APAC & Global</p>
                    <p className="text-[14px] font-bold text-foreground mt-1">5–9 Days</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-3xl mx-auto space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{rev.name}</p>
                        <p className="text-[11px] text-muted-foreground">{rev.date} · Verified Buyer</p>
                      </div>
                      <div className="flex items-center text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4 bg-card border border-border rounded-2xl space-y-3">
                  <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/40" />
                  <p className="text-sm font-semibold text-foreground">No Customer Reviews Yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Be the first to share your experience with this model. All customer feedback is verified post-delivery.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Related Items */}
        {related.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                More from {product.brand}
              </h2>
              <Link
                to={`/shop?brand=${encodeURIComponent(product.brand)}`}
                className="text-[13px] text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                View full brand collection <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={isWishlisted(p.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Fullscreen Image Lightbox Modal */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeImage}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
};

export default ProductPage;
