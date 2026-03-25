import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, Package, Menu, X, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import shipnestLogo from "@/assets/shipnest-logo.jpg";

const Navbar = () => {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filtered = searchQuery.length > 1
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={shipnestLogo} alt="ShipNest" className="w-9 h-9 rounded-full" />
          <span className="font-orbitron text-lg font-bold gold-text hidden sm:block">SHIPNEST</span>
        </Link>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            {filtered.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                {filtered.map(p => (
                  <button key={p.id} onClick={() => { navigate(`/product/${p.id}`); setSearchQuery(""); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left">
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-contain rounded" onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">${p.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/shop" className="px-3 py-2 text-sm text-foreground hover:text-primary transition-colors font-medium">Shop</Link>
          <Link to="/wishlist" className="p-2 text-foreground hover:text-primary transition-colors relative">
            <Heart className="w-5 h-5" />
          </Link>
          <Link to="/cart" className="p-2 text-foreground hover:text-primary transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gold-gradient text-xs font-bold flex items-center justify-center text-primary-foreground">{totalItems}</span>
            )}
          </Link>
          <Link to="/track" className="px-3 py-2 text-sm font-medium flex items-center gap-1.5 text-primary hover:text-gold-light transition-colors">
            <Package className="w-4 h-4" /> Track
          </Link>
          <Link to="/admin" className="p-2 text-foreground hover:text-primary transition-colors">
            <User className="w-5 h-5" />
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-foreground"><Search className="w-5 h-5" /></button>
          <Link to="/cart" className="p-2 text-foreground relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gold-gradient text-xs font-bold flex items-center justify-center text-primary-foreground">{totalItems}</span>}
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
          </div>
          {filtered.length > 0 && (
            <div className="absolute left-4 right-4 top-full bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
              {filtered.map(p => (
                <button key={p.id} onClick={() => { navigate(`/product/${p.id}`); setSearchQuery(""); setSearchOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left">
                  <img src={p.image} alt={p.name} className="w-10 h-10 object-contain rounded" onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                  <div><p className="text-sm font-medium text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">${p.price}</p></div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="flex flex-col p-4 gap-2">
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors">Shop</Link>
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"><Heart className="w-4 h-4" /> Wishlist</Link>
            <Link to="/track" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-primary hover:bg-muted rounded-lg transition-colors flex items-center gap-2"><Package className="w-4 h-4" /> Track Order</Link>
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"><User className="w-4 h-4" /> Admin</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
