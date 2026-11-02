import { useState, useMemo } from "react";
import { Product } from "@/types";
import { Heart, Star, ShoppingBag, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import ProductImage from "@/components/ProductImage";
import { getProductStageTheme } from "@/lib/productPresentation";

interface Props {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const ProductCard = ({ product, isWishlisted, onToggleWishlist }: Props) => {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const monthly = product.price ? Math.round(product.price / 12) : null;
  const stageTheme = useMemo(() => getProductStageTheme(product), [product]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.price === null) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="group relative flex flex-col h-full bg-card border border-border/70 rounded-3xl p-3.5 sm:p-4 transition-all duration-300 hover:shadow-xl hover:border-foreground/20 hover:-translate-y-1 overflow-hidden">
      {/* Top badges: Stock / Variant Badge (fixed h-6 to keep all cards uniform) */}
      <div className="flex items-center justify-between h-6 mb-1.5">
        {product.badge ? (
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              product.badge === "LUXURY"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                : "bg-primary/10 text-primary"
            }`}
          >
            {product.badge}
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
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

      {/* Product Image Stage (Seamless 1:1 square stage on pure white #ffffff) */}
      <Link to={`/product/${product.id}`} className="block my-1 focus:outline-none">
        <div
          className="aspect-square rounded-2xl flex items-center justify-center overflow-hidden p-2.5 transition-all duration-300 bg-white"
        >
          <ProductImage
            src={product.image}
            fallbackImages={product.fallbackImages}
            alt={product.name}
            department={product.department}
            category={product.category}
            stageTheme={{ background: "#ffffff", borderColor: "#e5e7eb", textColor: "#09090b", isLight: true }}
            loading="lazy"
            width={400}
            height={400}
            className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Color Variants Dots Preview (uniform reserved height so cards don't misalign) */}
      <div className="h-4 flex items-center justify-center gap-1.5 my-1">
        {product.colors && product.colors.length > 0 ? (
          <>
            {product.colors.slice(0, 5).map((c, idx) => (
              <span
                key={idx}
                title={c.name}
                className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[10px] text-muted-foreground font-mono">+{product.colors.length - 5}</span>
            )}
          </>
        ) : null}
      </div>

      {/* Info & Title */}
      <div className="flex-1 flex flex-col pt-0.5">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-[14px] sm:text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] sm:text-[12px] text-muted-foreground mt-0.5 line-clamp-1">
          {product.specs[0] || product.brand}
        </p>

        {/* Rating / Verification strip */}
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground h-4">
          {product.reviews > 0 ? (
            <>
              <div className="flex items-center text-amber-500">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="ml-1 font-semibold text-foreground">{product.rating}</span>
              </div>
              <span>·</span>
              <span className="truncate">{product.reviews.toLocaleString()} reviews</span>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground truncate">
              {product.department === "Technology" ? "Flagship · Sealed Box" : "Authentic Luxury · Verified"}
            </span>
          )}
        </div>
      </div>

      {/* Pricing & Add to Cart Block (Pinned to bottom via mt-auto, no text collisions) */}
      <div className="mt-auto pt-3 border-t border-border/60 space-y-2">
        <div className="flex items-baseline justify-between gap-1 flex-wrap">
          {product.price !== null ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[16px] sm:text-[17px] font-bold text-foreground tabular-nums">
                  ${product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[11px] sm:text-[12px] text-muted-foreground line-through tabular-nums">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              {monthly && (
                <span className="text-[10px] sm:text-[11px] text-muted-foreground tabular-nums font-medium">
                  From ${monthly}/mo
                </span>
              )}
            </>
          ) : (
            <div>
              <span className="text-[13px] font-semibold text-foreground block">Price Upon Inquiry</span>
              <p className="text-[10px] text-muted-foreground">Concierge Sourcing</p>
            </div>
          )}
        </div>

        {/* Dedicated Full-Width Action Button (Apple Style) */}
        {product.price !== null ? (
          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className={`w-full py-2.5 px-3 rounded-full text-[12px] font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-foreground text-background hover:bg-foreground/85"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Add to cart"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added to Bag
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
              </>
            )}
          </button>
        ) : (
          <Link
            to={`/product/${product.id}`}
            className="w-full py-2.5 px-3 rounded-full text-[12px] font-semibold bg-secondary text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1"
          >
            Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
