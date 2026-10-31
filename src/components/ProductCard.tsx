import { useState } from "react";
import { Product } from "@/types";
import { Heart, Star, ShoppingBag, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";

interface Props {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const ProductCard = ({ product, isWishlisted, onToggleWishlist }: Props) => {
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const monthly = (product.price / 12).toFixed(2);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="group relative flex flex-col bg-card border border-border/70 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:border-foreground/20 hover:-translate-y-1 overflow-hidden">
      {/* Top badges: Stock / Variant Badge */}
      <div className="flex items-center justify-between mb-2">
        {product.badge ? (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {product.badge}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {product.brand}
          </span>
        )}

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className="p-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-destructive text-destructive" : ""}`} />
          </button>
        )}
      </div>

      {/* Product Image Stage */}
      <Link to={`/product/${product.id}`} className="block my-2">
        <div className="aspect-[4/3] sm:aspect-square rounded-xl flex items-center justify-center overflow-hidden bg-[#fbfbfd] p-3 transition-colors group-hover:bg-[#f6f6f9]">
          {!imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-center text-muted-foreground p-4">
              <span className="text-2xl font-mono text-muted-foreground/50">SN</span>
              <p className="text-[11px] mt-1 font-medium">{product.name}</p>
            </div>
          )}
        </div>
      </Link>

      {/* Color Variants Dots Preview */}
      {product.colors && product.colors.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 my-1.5">
          {product.colors.slice(0, 5).map((c, idx) => (
            <span
              key={idx}
              title={c.name}
              className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          {product.colors.length > 5 && (
            <span className="text-[10px] text-muted-foreground font-mono">+{product.colors.length - 5}</span>
          )}
        </div>
      )}

      {/* Info & Title */}
      <div className="flex-1 flex flex-col pt-1">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">
          {product.specs[0] || product.brand}
        </p>

        {/* Rating strip */}
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
          <div className="flex items-center text-amber-500">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="ml-1 font-semibold text-foreground">{product.rating}</span>
          </div>
          <span>·</span>
          <span>{product.reviews.toLocaleString()} reviews</span>
        </div>

        {/* Pricing Block */}
        <div className="mt-3 pt-3 border-t border-border/60 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-semibold text-foreground tabular-nums">${product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-[12px] text-muted-foreground line-through tabular-nums">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              or ${monthly}/mo.
            </p>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all flex items-center gap-1.5 ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-foreground text-background hover:bg-foreground/85 active:scale-95"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Add to cart"
          >
            {added ? (
              <>
                <Check className="w-3 h-3" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
