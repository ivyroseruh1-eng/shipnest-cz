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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="bg-card border border-border rounded-2xl p-8 flex items-center justify-center aspect-square">
          <img src={product.image} alt={product.name}
            className="max-h-full max-w-full object-contain"
            onError={e => {
              const img = e.target as HTMLImageElement;
              if (product.fallbackImages.length > 0) img.src = product.fallbackImages[0];
            }} />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{product.brand}</p>
            <h1 className="text-3xl font-bold font-orbitron text-foreground mt-1">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-primary">{"★".repeat(Math.floor(product.rating))}</span>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews.toLocaleString()} reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black font-orbitron text-foreground">${product.price}</span>
            {savings > 0 && (
              <>
                <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                <span className="px-3 py-1 rounded-full bg-success/20 text-success text-sm font-bold">Save ${savings}</span>
              </>
            )}
          </div>

          {product.badge && (
            <span className="inline-block px-3 py-1 rounded-full gold-gradient text-primary-foreground text-xs font-bold font-orbitron">{product.badge}</span>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Key Specifications</h3>
            <ul className="space-y-1.5">
              {product.specs.map(s => (
                <li key={s} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-success font-semibold">✓ In Stock — Ships within 24 hours</p>
            <p className="text-muted-foreground">📍 Dispatched from Prague, Czech Republic 🇨🇿</p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleBuyNow}
              className="flex-1 gold-gradient text-primary-foreground py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <CreditCard className="w-5 h-5" /> Buy Now
            </button>
            <button onClick={() => addToCart(product)}
              className="flex-1 border border-primary text-primary py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button onClick={() => toggleWishlist(product.id)}
              className="p-3 border border-border rounded-xl hover:border-primary transition-colors">
              <Heart className={`w-6 h-6 ${isWishlisted(product.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
