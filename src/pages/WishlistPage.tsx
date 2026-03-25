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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Heart className="w-16 h-16 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold font-orbitron text-foreground">Your wishlist is empty</h1>
        <Link to="/shop" className="inline-block gold-gradient text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold font-orbitron text-foreground">Wishlist ({wishlisted.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlisted.map(p => <ProductCard key={p.id} product={p} isWishlisted={isWishlisted(p.id)} onToggleWishlist={toggleWishlist} />)}
      </div>
    </div>
  );
};

export default WishlistPage;
