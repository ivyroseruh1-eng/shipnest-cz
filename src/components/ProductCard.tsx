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

  return (
    <div className="group relative flex flex-col">
      {/* Wishlist */}
      {onToggleWishlist && (
        <button onClick={() => onToggleWishlist(product.id)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>
      )}

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square bg-secondary rounded-2xl flex items-center justify-center p-8 overflow-hidden mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
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

        {/* Price */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground tracking-tight">${product.price}</span>
            {savings > 0 && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
          {savings > 0 && (
            <span className="text-[11px] font-semibold text-success">Save ${savings}</span>
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
