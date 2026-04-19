import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Check, Truck, Shield, RotateCcw, Star, ChevronDown, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/ProductCard";
import { getProductReviews } from "@/data/reviews";

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

  const handleBuyNow = () => {
    addToCart(product, 1);
    navigate("/checkout");
  };

  // Spec ladder — Apple style accordion
  const specSections = [
    { id: "overview", title: "Overview", items: product.specs },
    { id: "in-the-box", title: "In the box", items: [`${product.name}`, "USB-C charging cable", "Quick start guide", "Authorized warranty card"] },
    { id: "shipping", title: "Shipping & Returns", items: ["Free delivery from Prague", "Estimated 23-29 business days to India", "30-day free returns", "2-year manufacturer warranty"] },
  ];

  return (
    <div className="bg-background">
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
      <section className="max-w-[980px] mx-auto px-4 pt-4 pb-8 text-center">
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
            <div className="bg-secondary rounded-2xl p-10 flex items-center justify-center aspect-square">
              {!imgError ? (
                <img
                  src={(product.colors?.[selectedColor]?.image) || product.image}
                  alt={`${product.name}${product.colors?.[selectedColor] ? ` - ${product.colors[selectedColor].name}` : ''}`}
                  className="max-h-full max-w-full object-contain"
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

            {/* CTAs — Apple blue pills */}
            <div className="space-y-3">
              <button onClick={handleBuyNow}
                className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium text-[15px] hover:bg-primary/90 transition-colors">
                Buy
              </button>
              <button onClick={() => addToCart(product)}
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

        {/* Spec ladder accordion */}
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
                  <ul className="pb-5 space-y-2">
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

        {/* Reviews */}
        <section id="reviews" className="mt-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Customer Reviews</h2>
            <span className="text-[13px] text-muted-foreground">{reviews.length} reviews</span>
          </div>
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

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-8 text-center">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
              {related.map(p => (
                <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
