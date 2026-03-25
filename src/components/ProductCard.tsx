import { Product } from "@/types";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";

interface Props {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const badgeColors: Record<string, string> = {
  NEW: "bg-accent text-accent-foreground",
  HOT: "bg-destructive text-destructive-foreground",
  SALE: "bg-success text-success-foreground",
  PRO: "gold-gradient text-primary-foreground",
  ELITE: "gold-gradient text-primary-foreground",
  BEST: "bg-accent text-accent-foreground",
  FOLD: "bg-secondary text-secondary-foreground",
  FLIP: "bg-secondary text-secondary-foreground",
};

const ProductCard = ({ product, isWishlisted, onToggleWishlist }: Props) => {
  const { addToCart } = useCart();
  const savings = product.originalPrice - product.price;

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden card-hover relative">
      {product.badge && (
        <span className={`absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-xs font-bold font-orbitron ${badgeColors[product.badge] || "bg-muted text-foreground"}`}>
          {product.badge}
        </span>
      )}
      {onToggleWishlist && (
        <button onClick={() => onToggleWishlist(product.id)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary/20 transition-colors">
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      )}

      <Link to={`/product/${product.id}`}>
        <div className="aspect-square p-6 flex items-center justify-center bg-muted/30">
          <img src={product.image} alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              const img = e.target as HTMLImageElement;
              if (product.fallbackImages.length > 0) img.src = product.fallbackImages[0];
              else img.style.display = "none";
            }} />
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-primary text-xs">{"★".repeat(Math.floor(product.rating))}</span>
          <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-orbitron text-foreground">${product.price}</span>
          {savings > 0 && (
            <>
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
              <span className="text-xs font-bold text-success">Save ${savings}</span>
            </>
          )}
        </div>
        <button onClick={() => addToCart(product)}
          className="w-full mt-2 flex items-center justify-center gap-2 gold-gradient text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
          <ShoppingCart className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
