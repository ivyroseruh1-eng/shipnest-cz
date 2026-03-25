import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Heart, CreditCard, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useNavigate } from "react-router-dom";

const ProductPage = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();

  if (!product) return <div className="text-center py-20 text-foreground">Product not found</div>;

  const savings = product.originalPrice - product.price;

  const handleBuyNow = () => {
    addToCart(product, 1);
    navigate("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="bg-secondary rounded-2xl p-10 flex items-center justify-center aspect-square">
          <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
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
                <span className="px-3 py-1 rounded-full bg-success/10 text-success text-[13px] font-semibold">Save ${savings}</span>
              </>
            )}
          </div>

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
            <p className="text-success font-semibold">✓ In Stock — Ships within 24 hours</p>
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
    </div>
  );
};

export default ProductPage;
