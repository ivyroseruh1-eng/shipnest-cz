import { useState, useMemo, useEffect } from "react";
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
  RotateCcw,
  Zap,
  Battery,
  Smartphone,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { getProductReviews } from "@/data/reviews";
import { getProductStageTheme } from "@/lib/productPresentation";
import { toast } from "sonner";

const STORAGE_OPTIONS = ["128GB", "256GB", "512GB", "1TB"];

const ProductPage = () => {
  const { id } = useParams();
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
  const [selectedStorage, setSelectedStorage] = useState(1); // Default to 256GB
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "shipping" | "reviews">("specs");
  const [added, setAdded] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Synchronize color selection with primary gallery image
  const selectedVariant = product?.colors?.[selectedColor];
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

  const activeImage = galleryList[activeImageIndex] || galleryList[0] || product?.image || "";
  const stageTheme = useMemo(
    () => getProductStageTheme(product, selectedVariant, activeImage),
    [product, selectedVariant, activeImage]
  );

  // Listen to scroll to reveal mobile sticky action bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 480) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const hasPrice = product.price !== null && product.price !== undefined;
  const savings =
    hasPrice && product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : null;
  const monthly = hasPrice ? (product.price / 12).toFixed(2) : null;

  const related = products
    .filter(
      (p) =>
        (p.department === product.department || p.category === product.category) &&
        p.id !== product.id
    )
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
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on ShipNest`,
          url: window.location.href,
        })
        .catch(() => {});
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
      {/* 1. Apple-Style Clean Breadcrumb Navigation */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-14 sm:top-16 z-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-[12px] text-muted-foreground">
          <nav className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link to="/shop" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link
              to={`/shop?brand=${encodeURIComponent(product.brand)}`}
              className="hover:text-foreground transition-colors"
            >
              {product.brand}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-foreground font-semibold truncate">{product.name}</span>
          </nav>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors text-[12px] shrink-0 font-medium ml-3"
            aria-label="Share product"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Interactive Stage & Apple Buying Experience */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column (7 cols): Full Interactive Apple Product Stage */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col-reverse sm:flex-row gap-4 items-start">
              {/* Thumbnail Strip (Sleek Apple pill thumbnails) */}
              {galleryList.length > 1 && (
                <div className="flex sm:flex-col gap-2.5 w-full sm:w-20 shrink-0 overflow-x-auto sm:overflow-x-hidden flex-nowrap py-1">
                  {galleryList.map((imgUrl, idx) => {
                    const isSelected = activeImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border p-1 transition-all bg-white shrink-0 ${
                          isSelected
                            ? "border-foreground ring-2 ring-foreground/20 shadow-xs opacity-100"
                            : "border-border hover:border-foreground/40 opacity-70 hover:opacity-100"
                        }`}
                        aria-label={`View angle ${idx + 1}`}
                      >
                        <ProductImage
                          src={imgUrl}
                          alt=""
                          width={80}
                          height={80}
                          stageTheme={{ background: "#ffffff", borderColor: "#e5e7eb", textColor: "#09090b", isLight: true }}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Main Apple Stage (Pure #ffffff canvas, zero black border box) */}
              <div className="flex-1 w-full bg-white border border-border/50 rounded-3xl p-6 sm:p-10 flex items-center justify-center aspect-square relative overflow-hidden group shadow-xs">
                {product.badge && (
                  <span className="absolute top-5 left-5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-foreground text-background shadow-xs">
                    {product.badge}
                  </span>
                )}

                <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
                  <button
                    onClick={() => setZoomOpen(true)}
                    className="p-2.5 rounded-full border border-border/70 bg-white/90 text-foreground hover:bg-white shadow-xs hover:scale-105 transition-all"
                    aria-label="Zoom image"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2.5 rounded-full border border-border/70 bg-white/90 shadow-xs hover:scale-105 transition-all"
                    aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        wish ? "fill-destructive text-destructive" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </div>

                {/* Animated Spring Image Switcher */}
                <div
                  className="w-full h-full flex items-center justify-center cursor-zoom-in relative"
                  onClick={() => setZoomOpen(true)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <ProductImage
                        src={activeImage}
                        fallbackImages={product.fallbackImages}
                        alt={product.name}
                        department={product.department}
                        category={product.category}
                        stageTheme={{ background: "#ffffff", borderColor: "#e5e7eb", textColor: "#09090b", isLight: true }}
                        priority={true}
                        loading="eager"
                        width={1000}
                        height={1000}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Left/Right Arrow Controls */}
                {galleryList.length > 1 && (
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                      onClick={prevImage}
                      className="pointer-events-auto w-10 h-10 rounded-full border border-border/80 bg-white/95 text-foreground shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="pointer-events-auto w-10 h-10 rounded-full border border-border/80 bg-white/95 text-foreground shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Apple Store Style Value Feature Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="bg-card border border-border/70 rounded-2xl p-3.5 text-center shadow-2xs">
                <Box className="w-4 h-4 mx-auto text-primary mb-1.5" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Factory Sealed
                </p>
                <p className="text-[12px] font-semibold text-foreground mt-0.5 truncate">
                  Intact Serial Seals
                </p>
              </div>

              <div className="bg-card border border-border/70 rounded-2xl p-3.5 text-center shadow-2xs">
                <Shield className="w-4 h-4 mx-auto text-emerald-600 mb-1.5" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Warranty
                </p>
                <p className="text-[12px] font-semibold text-foreground mt-0.5 truncate">
                  2-Year Full Coverage
                </p>
              </div>

              <div className="bg-card border border-border/70 rounded-2xl p-3.5 text-center shadow-2xs">
                <Truck className="w-4 h-4 mx-auto text-primary mb-1.5" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Air Express
                </p>
                <p className="text-[12px] font-semibold text-foreground mt-0.5 truncate">
                  Insured 2–4 Days
                </p>
              </div>

              <div className="bg-card border border-border/70 rounded-2xl p-3.5 text-center shadow-2xs">
                <Sparkles className="w-4 h-4 mx-auto text-amber-500 mb-1.5" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Protection
                </p>
                <p className="text-[12px] font-semibold text-foreground mt-0.5 truncate">
                  Secure Delivery PIN
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Apple Store Buying Console */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
                  {product.brand} · Official Flagship
                </span>
                {product.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mt-2 leading-[1.08]">
                {product.name}
              </h1>

              {/* Tagline / Subtitle */}
              <p className="text-[14px] sm:text-[15px] text-muted-foreground mt-2 leading-relaxed">
                {product.specs?.[0] || "Engineered for absolute performance with official manufacturer warranty."}
              </p>

              {/* Star Rating & Verified Status */}
              <div className="flex items-center gap-2 mt-3 text-[13px]">
                {product.reviews > 0 ? (
                  <>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-foreground">{product.rating}</span>
                    </div>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {product.reviews.toLocaleString()} verified reviews
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full font-medium">
                    Verified Factory Sealed
                  </span>
                )}
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[12px]">
                  <Check className="w-3.5 h-3.5" /> In Stock & Ready to Dispatch
                </span>
              </div>
            </div>

            {/* Apple-Style Price Block */}
            <div className="p-5 sm:p-6 bg-card border border-border/80 rounded-3xl space-y-2 shadow-2xs">
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
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Save ${savings}
                        </span>
                      </>
                    )}
                  </div>
                  {monthly && (
                    <p className="text-[13px] text-muted-foreground font-normal">
                      Or <span className="font-semibold text-foreground">${monthly}/mo.</span> for 12 mo. with 0% interest*
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-1">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Price Upon Inquiry
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Sourced directly on request via authorized distribution networks.
                  </p>
                </div>
              )}
            </div>

            {/* Color / Finish Selector (Apple style swatches) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <label className="text-[13px] font-semibold text-foreground flex items-center justify-between">
                  <span>
                    Finish — <span className="font-normal text-muted-foreground">{product.colors[selectedColor]?.name}</span>
                  </span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color, index) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(index);
                        setActiveImageIndex(0);
                      }}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border text-[13px] font-medium transition-all ${
                        selectedColor === index
                          ? "border-foreground bg-secondary/80 font-semibold shadow-xs ring-1 ring-foreground/20"
                          : "border-border/80 hover:border-foreground/40 bg-card"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/15 shrink-0 shadow-2xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage / Capacity Selector (Apple style segmented pills) */}
            {product.department === "Technology" && (
              <div className="space-y-3">
                <label className="text-[13px] font-semibold text-foreground block">
                  Capacity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {STORAGE_OPTIONS.map((size, index) => (
                    <button
                      key={size}
                      onClick={() => setSelectedStorage(index)}
                      className={`py-2.5 rounded-2xl border text-[13px] font-semibold transition-all text-center ${
                        selectedStorage === index
                          ? "border-foreground bg-foreground text-background shadow-xs"
                          : "border-border/80 hover:border-foreground/40 bg-card text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Apple Store Action Buttons */}
            <div className="space-y-3 pt-2">
              {hasPrice ? (
                <div className="space-y-2.5">
                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-4 px-6 rounded-full font-semibold text-[15px] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] ${
                      added
                        ? "bg-emerald-600 text-white"
                        : "bg-foreground text-background hover:bg-foreground/85"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-5 h-5" /> Added to Bag
                      </>
                    ) : (
                      "Add to Bag"
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-6 rounded-full bg-secondary text-foreground font-semibold text-[14px] hover:bg-secondary/70 transition-all border border-border active:scale-[0.99]"
                  >
                    Instant Checkout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setInquirySent(true);
                      toast.success("Concierge inquiry submitted for " + product.name);
                    }}
                    className={`w-full py-4 px-6 rounded-full font-semibold text-[15px] transition-all flex items-center justify-center gap-2 shadow-sm ${
                      inquirySent
                        ? "bg-emerald-600 text-white"
                        : "bg-foreground text-background hover:bg-foreground/85"
                    }`}
                  >
                    {inquirySent ? (
                      <>
                        <Check className="w-5 h-5" /> Sourcing Request Received
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" /> Request Private Sourcing Quote
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Direct communication with our luxury tech concierge desk within 2 business hours.
                  </p>
                </div>
              )}

              <p className="text-[11px] text-center text-muted-foreground">
                Dispatches via Express Air Cargo · Insured Transit to 60+ Countries
              </p>
            </div>

            {/* Authenticity Promise Callout */}
            <div className="border border-border/80 rounded-3xl p-4 sm:p-5 bg-card/60 backdrop-blur-sm space-y-2 shadow-2xs">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">ShipNest Authenticity Promise</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.authenticityEvidence ||
                      "Original manufacturer packaging and tamper-evident transit seals verified before departure."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Signature Apple Bento Feature Grid */}
        <div className="mt-16 sm:mt-24 pt-12 border-t border-border">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Engineered for Excellence.
            </h2>
            <p className="text-[14px] text-muted-foreground">
              Every detail verified under strict European custody protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-[16px] font-bold text-foreground">Next-Gen Silicon</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Powered by industry-leading 2nm processing architecture for unmatched speed and energy efficiency.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-[16px] font-bold text-foreground">Pro Camera System</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                48MP optical matrix with variable aperture and 5x tetraprism telephoto for cinema-grade results.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-[16px] font-bold text-foreground">Grade 5 Titanium</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Aerospace-grade titanium enclosure providing maximum structural rigidity with featherweight comfort.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Battery className="w-5 h-5" />
              </div>
              <h3 className="text-[16px] font-bold text-foreground">All-Day Endurance</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                High-density silicon-carbon battery delivering up to 35 hours of continuous multimedia playback.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Specifications, Sourcing & Customer Feedback Tabs */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: "specs", label: "Technical Specifications" },
              { id: "shipping", label: "Express Logistics & Customs" },
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
            <div className="max-w-3xl mx-auto divide-y divide-border/70 border border-border/80 rounded-3xl bg-card overflow-hidden shadow-xs">
              {product.specs.map((spec, i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
                >
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
              <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="text-[17px] font-bold text-foreground">Worldwide Express Air Delivery</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Every order placed on ShipNest is fulfilled directly from our certified bonded air logistics facility.
                  Consignments are sorted, sealed under strict chain of custody, and air-dispatched via premier global
                  carriers (DHL Express, FedEx, UPS).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 bg-secondary/50 rounded-2xl text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Europe & UK
                    </p>
                    <p className="text-[16px] font-bold text-foreground mt-1">2–4 Business Days</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-2xl text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                      North America
                    </p>
                    <p className="text-[16px] font-bold text-foreground mt-1">3–5 Business Days</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-2xl text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                      APAC & Global
                    </p>
                    <p className="text-[16px] font-bold text-foreground mt-1">5–8 Business Days</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-3xl mx-auto space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev, idx) => (
                  <div key={idx} className="bg-card border border-border/80 rounded-3xl p-5 space-y-2 shadow-xs">
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
                <div className="text-center py-12 px-4 bg-card border border-border/80 rounded-3xl space-y-3">
                  <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/40" />
                  <p className="text-sm font-semibold text-foreground">No Customer Reviews Yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Be the first to share your experience with this model. All customer feedback is verified
                    post-delivery.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Related Flagships */}
        {related.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">You May Also Like</h2>
                <p className="text-[13px] text-muted-foreground mt-1">Curated alternatives in the same category.</p>
              </div>
              <Link
                to={`/shop?brand=${encodeURIComponent(product.brand)}`}
                className="text-[13px] text-primary hover:underline font-semibold inline-flex items-center gap-1"
              >
                View collection <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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

      {/* 6. Mobile Sticky Bottom Purchase Bar (Apple Store Style) */}
      <AnimatePresence>
        {showStickyBar && hasPrice && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border py-3 px-4 z-40 flex items-center justify-between gap-3 shadow-lg lg:hidden"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-foreground truncate">{product.name}</p>
              <p className="text-[12px] font-semibold text-foreground tabular-nums">${product.price}</p>
            </div>
            <button
              onClick={handleAddToCart}
              className={`py-2.5 px-6 rounded-full font-semibold text-[13px] transition-all flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 ${
                added ? "bg-emerald-600 text-white" : "bg-foreground text-background"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added
                </>
              ) : (
                "Add to Bag"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Image Lightbox Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomOpen(false)}
          >
            <button
              onClick={() => setZoomOpen(false)}
              className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
              aria-label="Close zoom"
            >
              <X className="w-6 h-6" />
            </button>
            <div
              className="max-w-4xl max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImage}
                alt={product.name}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;
