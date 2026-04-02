import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, CreditCard, ChevronRight, Check, Truck, Shield, RotateCcw, Star } from "lucide-react";
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

  if (!product) return <div className="text-center py-20 text-foreground">Product not found</div>;

  const savings = product.originalPrice - product.price;
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const reviews = getProductReviews(product.id);

  const handleBuyNow = () => {
    addToCart(product, 1);
    navigate("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground transition-colors">{product.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        {/* Image */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-10 flex items-center justify-center aspect-square border border-border/40">
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
          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Free Shipping" },
              { icon: Shield, label: "2-Year Warranty" },
              { icon: RotateCcw, label: "30-Day Returns" },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2 bg-secondary rounded-xl p-3">
                <b.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[11px] text-muted-foreground font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6 py-4">
          <div>
            <p className="text-[12px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">{product.brand}</p>
            <h1 className="text-3xl font-bold text-foreground mt-2 tracking-tight leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-px">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? "text-amber-500" : "text-border"}`}>★</span>
                ))}
              </div>
              <span className="text-[13px] text-muted-foreground">{product.rating} ({product.reviews.toLocaleString()} reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-foreground tracking-tight">${product.price}</span>
            {savings > 0 && (
              <>
                <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[13px] font-semibold">Save ${savings}</span>
              </>
            )}
          </div>

          {/* Stock status */}
          <div className="space-y-1.5 text-[14px]">
            {product.inStock ? (
              <p className="text-emerald-600 font-semibold">✓ In Stock — Ships within 24 hours</p>
            ) : (
              <p className="text-red-500 font-semibold">✗ Out of Stock</p>
            )}
            <p className="text-muted-foreground">Dispatched from Prague, Czech Republic 🇨🇿</p>
          </div>

          {/* Color selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-[15px]">Color</h3>
                <span className="text-[13px] text-muted-foreground">— {product.colors[selectedColor].name}</span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => { setSelectedColor(i); setImgError(false); }}
                    className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === i ? "border-foreground ring-2 ring-foreground/20 ring-offset-2" : "border-border hover:border-muted-foreground"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
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

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground text-[15px]">Key Specifications</h3>
            <ul className="space-y-2">
              {product.specs.map(s => (
                <li key={s} className="text-[14px] text-muted-foreground flex items-start gap-2">
                  <span className="text-foreground mt-0.5 text-[10px]">●</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleBuyNow}
              className="flex-1 bg-foreground text-background py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors">
              <CreditCard className="w-5 h-5" /> Buy Now
            </button>
            <button onClick={() => addToCart(product)}
              className="flex-1 border border-foreground/20 text-foreground py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button onClick={() => toggleWishlist(product.id)}
              className="p-3.5 border border-border rounded-full hover:bg-secondary transition-colors">
              <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Customer Reviews</h2>
          <span className="text-[13px] text-muted-foreground">{reviews.length} reviews</span>
        </div>
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <div key={i} className="bg-secondary/50 border border-border/50 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-[12px] font-bold text-foreground">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {r.verified && (
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mr-2">✓ Verified</span>
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

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {related.map(p => (
              <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
