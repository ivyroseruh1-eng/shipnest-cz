import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Check, Truck, Shield, RotateCcw, Star, ChevronDown, ChevronRight, Sparkles, Cpu, Camera, Battery } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/ProductCard";
import { getProductReviews } from "@/data/reviews";
import Reveal from "@/components/Reveal";
import DeliverTo from "@/components/product/DeliverTo";
import ReviewSummary from "@/components/ai/ReviewSummary";

const ProductPage = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [openSpec, setOpenSpec] = useState<string | null>("overview");

  if (!product) return <div className="text-center py-20 text-foreground">Product not found</div>;

  const savings = product.originalPrice - product.price;
  const monthly = (product.price / 12).toFixed(2);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const reviews = getProductReviews(product.id);
  const selectedVariant = product.colors?.[selectedColor];
  const selectedImage = selectedVariant?.image || product.image;
  const selectedProduct = selectedVariant ? { ...product, image: selectedImage, name: `${product.name} - ${selectedVariant.name}` } : product;

  // Color-tinted background based on selected variant
  const tintStyle = useMemo(() => {
    const hex = selectedVariant?.hex || "#f5f5f7";
    return {
      background: `linear-gradient(180deg, ${hex}22 0%, ${hex}10 60%, transparent 100%)`,
    };
  }, [selectedVariant]);

  const handleBuyNow = () => {
    addToCart(selectedProduct, 1);
    navigate("/checkout");
  };

  // Headline feature stats parsed from specs
  const featureStats = [
    { icon: Cpu, label: "Chip", value: product.specs.find(s => /chip|snapdragon|tensor|exynos|dimensity/i.test(s))?.split(/,| /).slice(0,3).join(" ") || "Flagship" },
    { icon: Camera, label: "Camera", value: product.specs.find(s => /MP|camera/i.test(s))?.match(/\d+\s?MP/i)?.[0] || "Pro Camera" },
    { icon: Battery, label: "Battery", value: "All-day" },
    { icon: Sparkles, label: "Display", value: product.specs[0]?.match(/[\d.]+["']?/)?.[0] || "OLED" },
  ];

  const faqs = [
    { q: "Will this work in my country?", a: `Yes — the ${product.name} ships as an international/EU model with unlocked global bands (4G/5G), works on every major carrier, and supports the standard payment & wallet apps for your region.` },
    { q: "What's included in the warranty?", a: "Every device carries a 2-year manufacturer warranty against defects, plus 30-day no-questions-asked returns from the date of delivery." },
    { q: "How long does shipping take?", a: "Orders dispatch from our Prague hub within 24 hours and reach most destinations in 3–9 business days via DHL, FedEx or UPS Express. You'll get tracking at every milestone." },
    { q: "Is this a genuine, sealed product?", a: "100%. Sealed in original manufacturer packaging with serial numbers verifiable on the brand's official site. ShipNest is an authorized retailer." },
    { q: "Can I pay in instalments?", a: "Yes — choose 6, 12 or 24-month financing at checkout, or pay in full. Region-specific options like EMI, Klarna and Affirm appear automatically based on your address." },
  ];

  // Spec ladder — Apple style accordion
  const specSections = [
    { id: "overview", title: "Overview", items: product.specs },
    { id: "in-the-box", title: "In the box", items: [`${product.name}`, "USB-C charging cable", "Quick start guide", "Authorized warranty card"] },
    { id: "shipping", title: "Shipping & Returns", items: ["Free express delivery from Prague", "Most destinations 3–9 business days", "30-day free returns", "2-year manufacturer warranty"] },
  ];

  return (
    <div className="bg-background transition-colors duration-700" style={tintStyle}>
      {/* Breadcrumb */}
      <nav className="max-w-[980px] mx-auto px-4 py-4 flex items-center gap-2 text-[12px] text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground transition-colors">{product.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Eyebrow + headline */}
      <section className="max-w-[980px] mx-auto px-4 pt-4 pb-8 text-center animate-fade-in">
        {product.badge && (
          <p className="text-[13px] text-primary font-medium uppercase tracking-wider mb-2">
            {product.badge === "NEW" ? "New" : product.badge === "PRO" ? "Pro" : product.badge === "HOT" ? "Best Seller" : product.badge}
          </p>
        )}
        <h1 className="display text-4xl sm:text-5xl md:text-6xl text-foreground">{product.name}</h1>
        <p className="text-xl text-muted-foreground mt-2 font-normal">{product.specs[0]}</p>
        <p className="text-[14px] text-foreground mt-4">From <span className="font-medium">${product.price}</span> or ${monthly}/mo. for 12 mo.<sup>*</sup></p>
      </section>

      {/* Main product layout */}
      <div className="max-w-[980px] mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="space-y-4 md:sticky md:top-24 md:self-start">
            <div className="bg-background border border-border rounded-2xl p-4 sm:p-8 flex items-center justify-center aspect-square overflow-hidden transition-all duration-500">
              {!imgError ? (
                <img
                  key={selectedImage}
                  src={selectedImage}
                  alt={`${product.name}${product.colors?.[selectedColor] ? ` - ${product.colors[selectedColor].name}` : ''}`}
                  className="w-full h-full object-contain animate-scale-in"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-3">📱</div>
                  <p className="text-sm">{product.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-7 py-2">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-px">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-amber-500 text-amber-500" : "text-border"}`} />
                ))}
              </div>
              <a href="#reviews" className="text-[13px] text-primary hover:opacity-75 transition-opacity">{product.rating} · {product.reviews.toLocaleString()} reviews</a>
            </div>

            {/* Price */}
            <div>
              <p className="text-3xl font-semibold text-foreground tracking-tight">${product.price}</p>
              {savings > 0 && (
                <p className="text-[14px] text-muted-foreground mt-1">
                  <span className="line-through">${product.originalPrice}</span>
                  <span className="text-success font-medium ml-2">Save ${savings}</span>
                </p>
              )}
              <p className="text-[14px] text-muted-foreground mt-2">or ${monthly}/mo. for 12 mo.<sup>*</sup></p>
            </div>

            {/* Color picker */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-foreground">Color — <span className="font-normal text-muted-foreground">{product.colors[selectedColor].name}</span></h3>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => { setSelectedColor(i); setImgError(false); }}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor === i ? "border-primary ring-2 ring-primary/20 ring-offset-2" : "border-border hover:border-muted-foreground"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      aria-label={c.name}
                    >
                      {selectedColor === i && (
                        <Check className={`w-4 h-4 absolute inset-0 m-auto ${
                          ["#F5F5F0","#E8E6DF","#C0C0C0","#A8A9AD","#F4C2C2","#F9E547","#D1E8D0","#F2A7B0","#C8DCE8","#A8D8B9","#87CEEB","#A4C8E1","#B8A9C9","#B0C4D8","#BFA58A","#D4AF37","#E5D68A","#9B8EB8","#6B8DAD"].some(h => h.toLowerCase() === c.hex.toLowerCase())
                            ? "text-foreground" : "text-white"
                        }`} strokeWidth={2.5} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* In-stock + delivery line */}
            <div className="space-y-2 py-3 border-y border-border text-[13px]">
              {product.inStock ? (
                <p className="flex items-center gap-2 text-foreground">
                  <Truck className="w-4 h-4" /> <span className="font-medium">In Stock</span> — Free delivery + Free Returns
                </p>
              ) : (
                <p className="text-destructive font-medium">Currently unavailable</p>
              )}
              <p className="text-muted-foreground text-[12px]">Dispatched from Prague, Czech Republic 🇨🇿</p>
            </div>

            {/* Deliver to (pincode) */}
            <DeliverTo />

            {/* CTAs — Apple blue pills */}
            <div className="space-y-3">
              <button onClick={handleBuyNow}
                className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium text-[15px] hover:bg-primary/90 transition-colors">
                Buy
              </button>
              <button onClick={() => addToCart(selectedProduct)}
                className="w-full bg-secondary text-foreground py-3 rounded-full font-medium text-[15px] hover:bg-secondary/70 transition-colors">
                Add to Bag
              </button>
              <button onClick={() => toggleWishlist(product.id)}
                className="w-full flex items-center justify-center gap-2 py-2 text-[13px] text-primary hover:opacity-75 transition-opacity">
                <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? "fill-destructive text-destructive" : ""}`} />
                {isWishlisted(product.id) ? "Saved" : "Save for later"}
              </button>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: Shield, label: "2-Yr Warranty" },
                { icon: RotateCcw, label: "30-Day Returns" },
              ].map(b => (
                <div key={b.label} className="flex flex-col items-center gap-1 bg-secondary rounded-xl p-3 text-center">
                  <b.icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                  <span className="text-[11px] text-muted-foreground font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editorial feature stats — animated */}
        <Reveal>
          <section className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {featureStats.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="bg-secondary/60 rounded-2xl p-6 text-center hover:bg-secondary transition-colors">
                  <s.icon className="w-6 h-6 mx-auto text-primary mb-3" strokeWidth={1.5} />
                  <p className="text-2xl font-semibold text-foreground tracking-tight">{s.value}</p>
                  <p className="text-[12px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </section>
        </Reveal>

        {/* Editorial feature blocks */}
        <section className="mt-20 space-y-6">
          <Reveal>
            <div className="bg-secondary rounded-3xl p-8 sm:p-14 text-center overflow-hidden">
              <p className="text-[12px] text-primary font-medium uppercase tracking-wider">Performance</p>
              <h3 className="display text-3xl sm:text-5xl mt-3 text-foreground">Built to outpace.</h3>
              <p className="text-[15px] text-muted-foreground mt-4 max-w-xl mx-auto">
                Engineered for the next generation of apps, games, and AI workloads — without breaking a sweat or burning your battery.
              </p>
              <div className="mt-8 flex justify-center">
                <img src={selectedImage} alt="" className="max-h-[260px] object-contain animate-fade-up" />
              </div>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal delay={100}>
              <div className="bg-foreground text-background rounded-3xl p-8 sm:p-10 min-h-[320px] flex flex-col justify-between">
                <div>
                  <p className="text-[12px] text-primary-glow font-medium uppercase tracking-wider">Camera</p>
                  <h4 className="text-2xl sm:text-3xl font-semibold mt-2 tracking-tight">Every shot, museum-grade.</h4>
                </div>
                <p className="text-[14px] text-background/70 mt-6">Pro-grade sensors, computational HDR, and night mode that sees what your eyes can't.</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="bg-secondary rounded-3xl p-8 sm:p-10 min-h-[320px] flex flex-col justify-between">
                <div>
                  <p className="text-[12px] text-primary font-medium uppercase tracking-wider">Design</p>
                  <h4 className="text-2xl sm:text-3xl font-semibold mt-2 tracking-tight text-foreground">Crafted to last.</h4>
                </div>
                <p className="text-[14px] text-muted-foreground mt-6">Aerospace-grade materials, IP-rated against dust and water, finished by hand.</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Spec ladder accordion */}
        <Reveal>
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-foreground tracking-tight text-center mb-8">Tech Specs</h2>
          <div className="border-t border-border">
            {specSections.map(section => (
              <div key={section.id} className="border-b border-border">
                <button
                  onClick={() => setOpenSpec(openSpec === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between py-5 text-left hover:opacity-75 transition-opacity">
                  <span className="text-[17px] font-semibold text-foreground">{section.title}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSpec === section.id ? "rotate-180" : ""}`} />
                </button>
                {openSpec === section.id && (
                  <ul className="pb-5 space-y-2 animate-fade-in">
                    {section.items.map(s => (
                      <li key={s} className="text-[14px] text-muted-foreground flex items-start gap-2 leading-relaxed">
                        <span className="text-foreground mt-1.5 text-[6px]">●</span> {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
        </Reveal>

        {/* FAQ */}
        <Reveal>
          <section className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight text-center mb-8">Frequently asked</h2>
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
          </section>
        </Reveal>

        {/* Reviews */}
        <Reveal>
        <section id="reviews" className="mt-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Customer Reviews</h2>
            <span className="text-[13px] text-muted-foreground">{reviews.length} reviews</span>
          </div>
          {/* Rating distribution */}
          {reviews.length > 0 && (
            <ReviewSummary productId={product.id} productName={product.name} reviews={reviews} />
          )}
          {reviews.length > 0 && (
            <div className="bg-secondary/50 rounded-2xl p-6 mb-6 grid sm:grid-cols-2 gap-6 items-center">
              <div className="text-center">
                <p className="display text-5xl text-foreground">{product.rating.toFixed(1)}</p>
                <div className="flex gap-px justify-center mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-amber-500 text-amber-500" : "text-border"}`} />
                  ))}
                </div>
                <p className="text-[12px] text-muted-foreground mt-1">{product.reviews.toLocaleString()} ratings</p>
              </div>
              <div className="space-y-1.5">
                {[5,4,3,2,1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-[12px]">
                      <span className="w-3 text-muted-foreground">{star}</span>
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <div className="flex-1 h-1.5 bg-border/60 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="bg-secondary rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-[12px] font-semibold text-foreground">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.verified && (
                      <span className="text-[10px] text-success font-semibold bg-success/10 px-2 py-0.5 rounded-full mr-2">✓ Verified</span>
                    )}
                    <div className="flex gap-px">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < r.rating ? "fill-amber-500 text-amber-500" : "text-border"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
        </Reveal>

        {/* Related */}
        {related.length > 0 && (
          <Reveal>
          <section className="mt-20">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-8 text-center">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
              {related.map(p => (
                <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />
              ))}
            </div>
          </section>
          </Reveal>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
