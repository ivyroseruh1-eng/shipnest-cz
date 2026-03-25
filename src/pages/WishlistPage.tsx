import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const WishlistPage = () => {
  const { wishlist, toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = products.filter(p => wishlist.includes(p.id));

  if (wishlisted.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-5">
        <Heart className="w-14 h-14 text-muted-foreground mx-auto" strokeWidth={1.5} />
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Your wishlist is empty</h1>
        <p className="text-[14px] text-muted-foreground">Save items you love to find them later.</p>
        <Link to="/shop" className="inline-block bg-foreground text-background px-8 py-3.5 rounded-full font-semibold text-[14px] hover:bg-foreground/90 transition-colors">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl font-bold text-foreground tracking-tight">Wishlist ({wishlisted.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {wishlisted.map(p => <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />)}
      </div>
    </div>
  );
};

export default WishlistPage;
