import { useState } from "react";
import { Product } from "@/types";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";

interface Props {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const ProductCard = ({ product, isWishlisted, onToggleWishlist }: Props) => {
  const { addToCart } = useCart();
  const savings = product.originalPrice - product.price;
  const [selectedColor, setSelectedColor] = useState(0);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative flex flex-col">
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-foreground text-background">
            {product.badge}
          </span>
        </div>
      )}

      {/* Wishlist */}
      {onToggleWishlist && (
        <button onClick={() => onToggleWishlist(product.id)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>
      )}

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square bg-white rounded-2xl flex items-center justify-center p-8 overflow-hidden mb-4 border border-border/40">
          {!imgError ? (
            <img
              src={(product.colors?.[selectedColor]?.image) || product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-xs">{product.name}</p>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="space-y-1.5 flex-1 flex flex-col">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-[0.12em]">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-muted-foreground transition-colors leading-snug">{product.name}</h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex gap-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-[11px] ${i < Math.floor(product.rating) ? "text-amber-500" : "text-border"}`}>★</span>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => { setSelectedColor(i); setImgError(false); }}
                title={c.name}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  selectedColor === i ? "border-foreground scale-110" : "border-border hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-2">
          {product.inStock ? (
            <p className="text-[11px] text-emerald-600 font-semibold mb-1">✓ In Stock</p>
          ) : (
            <p className="text-[11px] text-red-500 font-semibold mb-1">Out of Stock</p>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground tracking-tight">${product.price}</span>
            {savings > 0 && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
          {savings > 0 && (
            <span className="text-[11px] font-semibold text-emerald-600">Save ${savings}</span>
          )}
        </div>

        <button onClick={() => addToCart(product)}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-full font-medium text-[13px] hover:bg-foreground/90 transition-colors">
          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
