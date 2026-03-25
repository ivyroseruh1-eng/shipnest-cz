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
    <div className="group bg-card border border-border rounded-xl overflow-hidden card-hover relative flex flex-col">
      {product.badge && (
        <span className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold font-orbitron uppercase tracking-wide ${badgeColors[product.badge] || "bg-muted text-foreground"}`}>
          {product.badge}
        </span>
      )}
      {onToggleWishlist && (
        <button onClick={() => onToggleWishlist(product.id)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary/20 transition-colors">
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      )}

      <Link to={`/product/${product.id}`}>
        <div className="aspect-square p-4 flex items-center justify-center bg-muted/20 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-3 sm:p-4 space-y-1.5 flex-1 flex flex-col">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-primary text-[10px]">{"★".repeat(Math.floor(product.rating))}</span>
          <span className="text-[10px] text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base sm:text-lg font-bold font-orbitron text-foreground">${product.price}</span>
          {savings > 0 && (
            <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
          )}
        </div>
        {savings > 0 && (
          <span className="text-[10px] font-semibold text-success">Save ${savings}</span>
        )}
        <button onClick={() => addToCart(product)}
          className="w-full mt-2 flex items-center justify-center gap-1.5 gold-gradient text-primary-foreground py-2 rounded-lg font-semibold text-xs hover:opacity-90 transition-opacity">
          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
