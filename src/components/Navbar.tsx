import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, Menu, X, User, ChevronDown, Headphones, Globe, Shield, Truck } from "lucide-react";
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
    <>
      {/* Top bar */}
      <div className="bg-muted/50 border-b border-border text-xs">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Ships from Prague, CZ</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Authentic Products</span>
            <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Free Express Shipping</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground ml-auto">
            <Link to="/track" className="hover:text-primary transition-colors">Track Order</Link>
            <span className="hidden sm:inline">|</span>
            <Link to="/shop" className="hover:text-primary transition-colors hidden sm:inline">Help & Support</Link>
            <span className="hidden sm:inline">|</span>
            <Link to="/admin" className="hover:text-primary transition-colors hidden sm:inline">Account</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={shipnestLogo} alt="ShipNest" className="w-8 h-8 rounded-full" />
            <span className="font-orbitron text-base font-bold gold-text hidden sm:block">SHIPNEST</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            <Link to="/shop" className="px-3 py-2 text-sm text-foreground hover:text-primary transition-colors font-medium">New Arrivals</Link>
            <Link to="/shop?category=iPhone+17" className="px-3 py-2 text-sm text-foreground hover:text-primary transition-colors font-medium">iPhone</Link>
            <Link to="/shop?brand=Samsung" className="px-3 py-2 text-sm text-foreground hover:text-primary transition-colors font-medium">Samsung</Link>
            <Link to="/shop?category=Mac" className="px-3 py-2 text-sm text-foreground hover:text-primary transition-colors font-medium">Mac</Link>
            <Link to="/shop?category=Audio" className="px-3 py-2 text-sm text-foreground hover:text-primary transition-colors font-medium">Audio</Link>
            <Link to="/shop" className="px-3 py-2 text-sm text-foreground hover:text-primary transition-colors font-medium flex items-center gap-0.5">
              More <ChevronDown className="w-3 h-3" />
            </Link>
          </div>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-xs relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              {filtered.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
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

          {/* Desktop icons */}
          <div className="hidden md:flex items-center gap-0.5">
            <Link to="/wishlist" className="p-2 text-foreground hover:text-primary transition-colors relative" title="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="p-2 text-foreground hover:text-primary transition-colors relative" title="Cart">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] rounded-full gold-gradient text-[10px] font-bold flex items-center justify-center text-primary-foreground">{totalItems}</span>
              )}
            </Link>
            <Link to="/admin" className="p-2 text-foreground hover:text-primary transition-colors" title="Account">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-1">
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
            <div className="flex flex-col p-4 gap-1">
              <Link to="/shop" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-foreground hover:bg-muted rounded-lg transition-colors text-sm font-medium">New Arrivals</Link>
              <Link to="/shop?category=iPhone+17" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-foreground hover:bg-muted rounded-lg transition-colors text-sm">iPhone</Link>
              <Link to="/shop?brand=Samsung" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-foreground hover:bg-muted rounded-lg transition-colors text-sm">Samsung</Link>
              <Link to="/shop?category=Mac" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-foreground hover:bg-muted rounded-lg transition-colors text-sm">Mac</Link>
              <Link to="/shop?category=Audio" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-foreground hover:bg-muted rounded-lg transition-colors text-sm">Audio</Link>
              <div className="border-t border-border my-2" />
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2 text-sm"><Heart className="w-4 h-4" /> Wishlist</Link>
              <Link to="/track" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2 text-sm"><Truck className="w-4 h-4" /> Track Order</Link>
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2 text-sm"><User className="w-4 h-4" /> Account</Link>
              <Link to="/shop" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2 text-sm"><Headphones className="w-4 h-4" /> Support</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
