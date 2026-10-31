import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/context/CartContext";
import { Heart, ArrowRight, ShoppingBag, Trash2, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const WishlistPage = () => {
  const { wishlist, toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = products.filter(p => wishlist.includes(p.id));

  const addAllToBag = () => {
    wishlisted.forEach(p => addToCart(p));
    toast.success(`Added ${wishlisted.length} item(s) to your bag`);
  };

  const shareWishlist = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Wishlist link copied to clipboard");
    }
  };

  if (wishlisted.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
          <Heart className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Your Wishlist is Empty</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Save flagship electronics and accessories you love to track price updates and dispatch availability.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3 rounded-full font-semibold text-sm hover:bg-foreground/90 transition-colors"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured Suggestions */}
        <div className="pt-16 border-t border-border space-y-6">
          <h2 className="text-base font-semibold text-foreground">Popular Flagships You May Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            {products.slice(0, 4).map(p => (
              <ProductCard
                key={p.id}
                product={p}
                isWishlisted={isWishlisted(p.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Saved Items</h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-foreground">
              {wishlisted.length} {wishlisted.length === 1 ? "Product" : "Products"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Complimentary express global shipping applied to all items upon checkout
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={shareWishlist}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-xl transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button
            onClick={addAllToBag}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-xl transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Move All to Bag
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {wishlisted.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            isWishlisted={isWishlisted(p.id)}
            onToggleWishlist={toggleWishlist}
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
