import { useState } from "react";
import { Product } from "@/types";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const ProductCard = ({ product, isWishlisted, onToggleWishlist }: Props) => {
  const [imgError, setImgError] = useState(false);
  const monthly = (product.price / 12).toFixed(2);

  return (
    <div className="group relative flex flex-col bg-card border border-border rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:shadow-lg hover:border-foreground/20 hover:-translate-y-1 overflow-hidden animate-fade-in">
      {/* Wishlist */}
      {onToggleWishlist && (
        <button onClick={() => onToggleWishlist(product.id)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 shadow-sm border border-border"
          aria-label="Save">
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
      )}

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square rounded-xl flex items-center justify-center overflow-hidden mb-4 bg-card">
          {!imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.08]"
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

      {/* Info — Apple/Samsung minimal */}
      <div className="space-y-1 flex-1 flex flex-col text-center px-1">
        {product.badge && (
          <p className="text-[11px] text-primary font-medium uppercase tracking-wider">
            {product.badge === "NEW" ? "New" : product.badge === "HOT" ? "Best Seller" : product.badge === "PRO" ? "Pro" : product.badge === "ELITE" ? "Featured" : product.badge === "BEST" ? "Editor's Choice" : product.badge}
          </p>
        )}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-[17px] font-semibold text-foreground hover:opacity-75 transition-opacity leading-tight tracking-tight">{product.name}</h3>
        </Link>
        <p className="text-[13px] text-muted-foreground pt-0.5">
          {product.specs[0]?.split(',')[0] || product.brand}
        </p>

        {/* Price block */}
        <div className="pt-3 space-y-0.5">
          <p className="text-[14px] text-foreground">
            From <span className="font-medium">${product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-muted-foreground line-through ml-2">${product.originalPrice}</span>
            )}
          </p>
          <p className="text-[12px] text-muted-foreground">
            or ${monthly}/mo. for 12 mo.<sup>*</sup>
          </p>
        </div>

        {/* CTA — Apple blue pill */}
        <div className="pt-5">
          <Link to={`/product/${product.id}`}
            className="inline-block bg-primary text-primary-foreground px-5 py-2 rounded-full font-medium text-[13px] hover:bg-primary/90 transition-colors">
            Buy
          </Link>
        </div>

        {!product.inStock && (
          <p className="text-[11px] text-destructive font-medium pt-2">Currently unavailable</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
