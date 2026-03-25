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
    <div className="group relative flex flex-col rounded-2xl overflow-hidden border border-border/60 bg-card shadow-md hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
      {/* Badge */}
      {product.badge && (
        <span className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md text-[10px] font-bold font-orbitron uppercase tracking-wider ${badgeColors[product.badge] || "bg-muted text-foreground"}`}>
          {product.badge}
        </span>
      )}

      {/* Wishlist */}
      {onToggleWishlist && (
        <button onClick={() => onToggleWishlist(product.id)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors">
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>
      )}

      {/* Image — white background so product photos blend perfectly */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[4/3] bg-white flex items-center justify-center p-6 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.15em]">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">{product.name}</h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-xs ${i < Math.floor(product.rating) ? "text-amber-400" : "text-border"}`}>★</span>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black font-orbitron text-foreground">${product.price}</span>
            {savings > 0 && (
              <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
          {savings > 0 && (
            <span className="text-[11px] font-bold text-success">Save ${savings}</span>
          )}
        </div>

        <button onClick={() => addToCart(product)}
          className="w-full mt-3 flex items-center justify-center gap-2 gold-gradient text-primary-foreground py-2.5 rounded-xl font-bold text-xs tracking-wide hover:opacity-90 transition-opacity">
          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
