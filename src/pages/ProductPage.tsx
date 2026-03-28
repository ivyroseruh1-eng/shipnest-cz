import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, CreditCard, ChevronRight, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/ProductCard";

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
                        c.hex.toLowerCase() === "#f5f5f0" || c.hex.toLowerCase() === "#e8e6df" || c.hex.toLowerCase() === "#c0c0c0" || c.hex.toLowerCase() === "#a8a9ad" || c.hex.toLowerCase() === "#f4c2c2" || c.hex.toLowerCase() === "#f9e547" || c.hex.toLowerCase() === "#d1e8d0" || c.hex.toLowerCase() === "#f2a7b0" || c.hex.toLowerCase() === "#c8dce8" || c.hex.toLowerCase() === "#a8d8b9" || c.hex.toLowerCase() === "#87ceeb" || c.hex.toLowerCase() === "#a4c8e1" || c.hex.toLowerCase() === "#b8a9c9" || c.hex.toLowerCase() === "#b0c4d8" || c.hex.toLowerCase() === "#bfa58a" || c.hex.toLowerCase() === "#d4af37" || c.hex.toLowerCase() === "#e5d68a" || c.hex.toLowerCase() === "#9b8eb8" || c.hex.toLowerCase() === "#6b8dad"
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

          <div className="space-y-1.5 text-[14px]">
            <p className="text-emerald-600 font-semibold">✓ In Stock — Ships within 24 hours</p>
            <p className="text-muted-foreground">Dispatched from Prague, Czech Republic 🇨🇿</p>
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
